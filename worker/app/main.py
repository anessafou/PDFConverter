from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import secrets
import shutil
import signal
import socket
import stat
import tempfile
import threading
import zipfile
import zlib
import xml.etree.ElementTree as ET
from pathlib import Path, PurePosixPath
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response
from pypdf import PdfReader


MAX_INPUT_BYTES = 25 * 1024 * 1024
MAX_OUTPUT_BYTES = 100 * 1024 * 1024
MAX_MULTIPART_OVERHEAD = 1 * 1024 * 1024
MAX_REQUEST_BODY_BYTES = MAX_INPUT_BYTES + MAX_MULTIPART_OVERHEAD
CONVERSION_TIMEOUT_SECONDS = 105
MAX_CONCURRENT_CONVERSIONS = 2
UPLOAD_CHUNK_BYTES = 64 * 1024
SOFFICE_BIN = os.environ.get("SOFFICE_BIN", "soffice")
WORK_DIR = Path(os.environ.get("WORKER_TMP_DIR", "/tmp/pdfconverter-worker"))
CALC_SOURCE_EXTENSIONS = frozenset({".xlsx", ".xls", ".ods"})
PYTHON3_BIN = os.environ.get("PYTHON3_BIN", "/usr/bin/python3")
logger = logging.getLogger("pdfconverter.worker.calc")

# This allowlist intentionally mirrors the current registry's accepted inputs and
# PDF output for the nine approved tools. Similar-looking slugs are not accepted.
SUPPORTED_CONVERSIONS: dict[str, frozenset[str]] = {
    "word-to-pdf": frozenset({".docx", ".doc"}),
    "doc-to-pdf": frozenset({".doc"}),
    "excel-to-pdf": frozenset({".xlsx", ".xls"}),
    "ppt-to-pdf": frozenset({".pptx", ".ppt"}),
    "odt-to-pdf": frozenset({".odt"}),
    "ods-to-pdf": frozenset({".ods"}),
    "odp-to-pdf": frozenset({".odp"}),
    "rtf-to-pdf": frozenset({".rtf"}),
    "txt-to-pdf": frozenset({".txt"}),
}

OOXML_REQUIRED_PARTS: dict[str, dict[str, str]] = {
    ".docx": {
        "[Content_Types].xml": "{http://schemas.openxmlformats.org/package/2006/content-types}Types",
        "word/document.xml": "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}document",
    },
    ".xlsx": {
        "[Content_Types].xml": "{http://schemas.openxmlformats.org/package/2006/content-types}Types",
        "xl/workbook.xml": "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}workbook",
    },
    ".pptx": {
        "[Content_Types].xml": "{http://schemas.openxmlformats.org/package/2006/content-types}Types",
        "ppt/presentation.xml": "{http://schemas.openxmlformats.org/presentationml/2006/main}presentation",
    },
}


def _json_error(send: Any, status: int, detail: str) -> Any:
    import json

    async def respond() -> None:
        body = json.dumps({"detail": detail}).encode("utf-8")
        await send(
            {
                "type": "http.response.start",
                "status": status,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("ascii")),
                    (b"cache-control", b"no-store"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})

    return respond()


class ConversionRequestGuard:
    """Authenticate, cap request bytes, and bound conversion concurrency early.

    The body is spooled with a 1 MiB in-memory threshold before Starlette's
    multipart parser sees it. This also places a hard total-body cap around
    chunked requests that do not supply Content-Length.
    """

    def __init__(self, app: Any, max_body_bytes: int, max_active: int) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes
        self.max_active = max_active
        self._active = 0
        self._lock = threading.Lock()

    async def __call__(self, scope: Any, receive: Any, send: Any) -> None:
        if not (
            scope.get("type") == "http"
            and scope.get("method") == "POST"
            and scope.get("path") == "/convert"
        ):
            await self.app(scope, receive, send)
            return

        headers = {key.lower(): value for key, value in scope.get("headers", [])}
        token = os.environ.get("CONVERSION_WORKER_TOKEN", "")
        if len(token) < 32:
            await _json_error(send, 503, "Conversion worker authentication is not configured.")
            return

        authorization = headers.get(b"authorization", b"").decode("latin-1")
        scheme, separator, supplied = authorization.partition(" ")
        if (
            not separator
            or scheme.lower() != "bearer"
            or not supplied
            or not secrets.compare_digest(supplied, token)
        ):
            await _json_error(send, 401, "A valid Bearer token is required.")
            return

        with self._lock:
            if self._active >= self.max_active:
                at_capacity = True
            else:
                at_capacity = False
                self._active += 1
        if at_capacity:
            await _json_error(send, 429, "Conversion capacity is busy. Retry shortly.")
            return

        try:
            content_length = headers.get(b"content-length")
            if content_length is not None:
                try:
                    declared_size = int(content_length)
                except ValueError:
                    await _json_error(send, 400, "Invalid Content-Length header.")
                    return
                if declared_size < 0 or declared_size > self.max_body_bytes:
                    await _json_error(send, 413, "Request body exceeds the upload limit.")
                    return

            with tempfile.SpooledTemporaryFile(max_size=1024 * 1024, mode="w+b") as body_file:
                body_size = 0
                while True:
                    message = await receive()
                    if message["type"] == "http.disconnect":
                        return
                    chunk = message.get("body", b"")
                    body_size += len(chunk)
                    if body_size > self.max_body_bytes:
                        await _json_error(send, 413, "Request body exceeds the upload limit.")
                        return
                    body_file.write(chunk)
                    if not message.get("more_body", False):
                        break

                body_file.seek(0)
                sent_final = False

                async def replay_body() -> dict[str, Any]:
                    nonlocal sent_final
                    chunk = body_file.read(UPLOAD_CHUNK_BYTES)
                    if chunk:
                        return {
                            "type": "http.request",
                            "body": chunk,
                            "more_body": body_file.tell() < body_size,
                        }
                    if not sent_final:
                        sent_final = True
                        return {"type": "http.request", "body": b"", "more_body": False}
                    return {"type": "http.disconnect"}

                await self.app(scope, replay_body, send)
        finally:
            with self._lock:
                self._active -= 1


class ConversionTimedOut(Exception):
    pass


class ConversionFailed(Exception):
    pass


async def run_libreoffice(input_path: Path, work_path: Path) -> None:
    profile_path = work_path / "lo-profile"
    profile_path.mkdir(mode=0o700)
    profile_url = profile_path.as_uri()
    if input_path.suffix.lower() in CALC_SOURCE_EXTENSIONS:
        await run_calc_export(input_path, work_path, profile_url)
        return

    command = [
        SOFFICE_BIN,
        "--headless",
        "--nologo",
        "--nodefault",
        "--nolockcheck",
        "--norestore",
        f"-env:UserInstallation={profile_url}",
        "--convert-to",
        "pdf",
        "--outdir",
        str(work_path),
        str(input_path),
    ]
    environment = os.environ.copy()
    environment.update({"HOME": "/tmp", "TMPDIR": "/tmp", "SAL_USE_VCLPLUGIN": "svp"})

    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdin=asyncio.subprocess.DEVNULL,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
            env=environment,
            start_new_session=True,
        )
    except FileNotFoundError as exc:
        raise ConversionFailed("Conversion engine is unavailable.") from exc

    try:
        return_code = await process.wait()
    except asyncio.CancelledError:
        _kill_process_group(process.pid)
        await process.wait()
        raise

    if return_code != 0:
        raise ConversionFailed("LibreOffice could not convert this document.")


async def run_calc_export(input_path: Path, work_path: Path, profile_url: str) -> None:
    """Use LibreOffice UNO to set per-sheet A4, orientation, and fit-to-width."""
    port_socket = socket.socket()
    try:
        port_socket.bind(("127.0.0.1", 0))
        port = port_socket.getsockname()[1]
    finally:
        port_socket.close()

    accept = f"socket,host=127.0.0.1,port={port};urp;StarOffice.ServiceManager"
    environment = os.environ.copy()
    # Neither child process needs the API token. Do not pass it across the
    # process boundary or risk it appearing in diagnostics.
    environment.pop("CONVERSION_WORKER_TOKEN", None)
    environment.update({"HOME": "/tmp", "TMPDIR": "/tmp", "SAL_USE_VCLPLUGIN": "svp"})
    office_log_path = work_path / "calc-libreoffice.log"
    helper_log_path = work_path / "calc-uno-helper.log"
    office_log = office_log_path.open("wb")
    try:
        office = await asyncio.create_subprocess_exec(
            SOFFICE_BIN,
            "--headless",
            "--nologo",
            "--nodefault",
            "--nolockcheck",
            "--norestore",
            f"-env:UserInstallation={profile_url}",
            f"--accept={accept}",
            stdin=asyncio.subprocess.DEVNULL,
            stdout=office_log,
            stderr=office_log,
            env=environment,
            start_new_session=True,
        )
    except OSError as exc:
        office_log.close()
        logger.exception("Could not start LibreOffice for Calc export")
        raise ConversionFailed("Conversion engine is unavailable.") from exc

    helper = None
    helper_path = Path(__file__).with_name("calc_export.py")
    helper_log = None
    try:
        helper_log = helper_log_path.open("wb")
        helper = await asyncio.create_subprocess_exec(
            PYTHON3_BIN,
            str(helper_path),
            str(input_path),
            str(work_path / "input.pdf"),
            str(port),
            stdin=asyncio.subprocess.DEVNULL,
            stdout=helper_log,
            stderr=helper_log,
            env=environment,
            start_new_session=True,
        )
        helper_return_code = await helper.wait()
        helper_log.flush()
        if os.environ.get("PDFCONV_CALC_LAYOUT_DIAGNOSTICS") == "1":
            logger.info(
                "Calc UNO layout diagnostics (bounded helper log): %s",
                _diagnostic_tail(helper_log_path, limit=32768),
            )
        if helper_return_code != 0:
            office_log.flush()
            logger.error(
                "Calc UNO helper exited with code %d. Helper output: %s; LibreOffice output: %s",
                helper_return_code,
                _diagnostic_tail(helper_log_path),
                _diagnostic_tail(office_log_path),
            )
            raise ConversionFailed("LibreOffice could not lay out this spreadsheet as PDF.")
    except OSError as exc:
        logger.exception("Could not start the Calc UNO helper using %s", PYTHON3_BIN)
        raise ConversionFailed("Spreadsheet layout support is unavailable.") from exc
    except asyncio.CancelledError:
        if helper is not None:
            _kill_process_group(helper.pid)
            await helper.wait()
        raise
    finally:
        if helper_log is not None:
            helper_log.close()
        _kill_process_group(office.pid)
        await office.wait()
        office_log.flush()
        office_log.close()


def _diagnostic_tail(path: Path, limit: int = 8192) -> str:
    """Read a bounded local child-process log, redacting the API token."""
    try:
        with path.open("rb") as diagnostic_file:
            diagnostic_file.seek(0, os.SEEK_END)
            length = diagnostic_file.tell()
            diagnostic_file.seek(max(0, length - limit))
            message = diagnostic_file.read(limit).decode("utf-8", errors="replace").strip()
    except OSError:
        return "<diagnostic log unavailable>"
    token = os.environ.get("CONVERSION_WORKER_TOKEN", "")
    if token:
        message = message.replace(token, "[redacted]")
    return message or "<no child-process output>"


def _kill_process_group(process_id: int) -> None:
    try:
        os.killpg(process_id, signal.SIGKILL)
    except ProcessLookupError:
        pass


def validate_pdf_output(output_path: Path, input_path: Path) -> int:
    try:
        output_stat = output_path.lstat()
    except FileNotFoundError as exc:
        raise ConversionFailed("The conversion engine did not produce a PDF.") from exc

    if not stat.S_ISREG(output_stat.st_mode):
        raise ConversionFailed("The conversion engine returned an invalid file.")
    if output_stat.st_size <= 0:
        raise ConversionFailed("The conversion engine returned an empty file.")
    if output_stat.st_size > MAX_OUTPUT_BYTES:
        raise HTTPException(status_code=413, detail="Converted PDF exceeds the 100 MiB output limit.")
    with output_path.open("rb") as output_file:
        signature = output_file.read(5)
    if signature != b"%PDF-":
        raise ConversionFailed("The conversion engine returned an invalid PDF.")

    try:
        with output_path.open("rb") as pdf_file:
            reader = PdfReader(pdf_file, strict=True)
            if reader.is_encrypted or len(reader.pages) < 1:
                raise ConversionFailed("The conversion engine returned an unreadable PDF.")
    except ConversionFailed:
        raise
    except Exception as exc:
        raise ConversionFailed("The conversion engine returned an unreadable PDF.") from exc

    # All approved source extensions differ from PDF; refuse an accidental byte echo.
    if input_path.stat().st_size == output_stat.st_size:
        if _file_sha256(input_path) == _file_sha256(output_path):
            raise ConversionFailed("The conversion engine returned the original input.")

    return output_stat.st_size


def validate_source_structure(input_path: Path, extension: str) -> None:
    """Reject corrupt OOXML packages before LibreOffice's recovery importer runs."""
    required_parts = OOXML_REQUIRED_PARTS.get(extension)
    if required_parts is None:
        return

    try:
        with zipfile.ZipFile(input_path) as package:
            if package.testzip() is not None:
                raise ConversionFailed("The uploaded Office document is malformed.")
            names = set(package.namelist())
            if not set(required_parts).issubset(names):
                raise ConversionFailed("The uploaded Office document is malformed.")
            for part, expected_root in required_parts.items():
                if ET.fromstring(package.read(part)).tag != expected_root:
                    raise ConversionFailed("The uploaded Office document is malformed.")
    except ConversionFailed:
        raise
    except (OSError, zipfile.BadZipFile, RuntimeError, ET.ParseError, KeyError, EOFError, zlib.error) as exc:
        raise ConversionFailed("The uploaded Office document is malformed.") from exc


def _file_sha256(path: Path) -> bytes:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(UPLOAD_CHUNK_BYTES):
            digest.update(chunk)
    return digest.digest()


app = FastAPI(
    title="PDFConverter Conversion Worker",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
app.add_middleware(
    ConversionRequestGuard,
    max_body_bytes=MAX_REQUEST_BODY_BYTES,
    max_active=MAX_CONCURRENT_CONVERSIONS,
)


@app.get("/healthz")
async def healthz() -> JSONResponse:
    if len(os.environ.get("CONVERSION_WORKER_TOKEN", "")) < 32 or not shutil.which(SOFFICE_BIN):
        return JSONResponse(status_code=503, content={"status": "not-ready"})
    return JSONResponse(content={"status": "ok"})


@app.post("/convert")
async def convert(
    file: UploadFile = File(...),
    tool_slug: str = Form(..., alias="toolSlug"),
    target_format: str = Form(..., alias="targetFormat"),
) -> Response:
    if tool_slug not in SUPPORTED_CONVERSIONS:
        raise HTTPException(status_code=400, detail="This conversion is not supported by this worker.")
    if target_format != "pdf":
        raise HTTPException(status_code=400, detail="This tool only supports PDF output.")

    original_name = file.filename or ""
    basename = original_name.replace("\\", "/").rsplit("/", 1)[-1]
    if not basename or "\x00" in basename:
        raise HTTPException(status_code=400, detail="A valid source filename is required.")
    extension = PurePosixPath(basename).suffix.lower()
    if extension not in SUPPORTED_CONVERSIONS[tool_slug]:
        raise HTTPException(status_code=415, detail="The source format is not supported for this tool.")

    try:
        WORK_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
        work_path = Path(tempfile.mkdtemp(prefix="job-", dir=WORK_DIR))
    except OSError as exc:
        raise HTTPException(status_code=503, detail="Worker temporary storage is unavailable.") from exc

    input_path = work_path / ("input" + extension)
    output_path = work_path / "input.pdf"
    try:
        source_bytes = 0
        with input_path.open("xb") as source_file:
            while chunk := await file.read(UPLOAD_CHUNK_BYTES):
                source_bytes += len(chunk)
                if source_bytes > MAX_INPUT_BYTES:
                    raise HTTPException(status_code=413, detail="Input file exceeds the 25 MiB limit.")
                source_file.write(chunk)
        if source_bytes == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        try:
            validate_source_structure(input_path, extension)
        except ConversionFailed as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        try:
            await asyncio.wait_for(
                run_libreoffice(input_path, work_path),
                timeout=CONVERSION_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError as exc:
            raise HTTPException(status_code=504, detail="Conversion exceeded the time limit.") from exc
        except ConversionFailed as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        output_size = validate_pdf_output(output_path, input_path)
        # Materialize the already size-limited PDF before returning. A file-backed
        # response defers reading until ASGI transmission and can interact poorly
        # with optimized path-send extensions and temporary-file cleanup. Returning
        # bytes makes the response independent of the job directory's lifetime.
        with output_path.open("rb") as output_file:
            pdf_bytes = output_file.read(output_size + 1)
        if len(pdf_bytes) != output_size or not pdf_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=422, detail="The conversion engine returned an invalid PDF.")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
                "Content-Disposition": 'attachment; filename="converted.pdf"',
            },
        )
    finally:
        await file.close()
        shutil.rmtree(work_path, ignore_errors=True)

from __future__ import annotations

import asyncio
import os
import re
import shutil
import threading
import zipfile
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

import openpyxl
import pytest
from fastapi.testclient import TestClient
from pypdf import PdfReader

from app import main
from conftest import (
    EXCEL_MARKER,
    PRESENTATION_MARKER,
    RTF_MARKER,
    TEXT_MARKER,
    WORD_MARKER,
)


TEST_TOKEN = "test-only-worker-token-that-is-long-enough-32chars"


@pytest.fixture(autouse=True)
def worker_token(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CONVERSION_WORKER_TOKEN", TEST_TOKEN)


@pytest.fixture
def client() -> TestClient:
    return TestClient(main.app)


def _post_conversion(client: TestClient, fixture: Path, tool: str, extension: str):
    return client.post(
        "/convert",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"},
        data={"toolSlug": tool, "targetFormat": "pdf"},
        files={"file": ("source." + extension, fixture.read_bytes(), "application/octet-stream")},
    )


def _compact_pdf_text(value: str) -> str:
    """Ignore punctuation/spacing differences introduced by PDF extraction."""
    return re.sub(r"[^a-z0-9]+", "", value.lower())


@pytest.mark.parametrize(
    ("tool", "extension", "marker"),
    [
        ("word-to-pdf", "docx", WORD_MARKER),
        ("word-to-pdf", "doc", WORD_MARKER),
        ("doc-to-pdf", "doc", WORD_MARKER),
        ("excel-to-pdf", "xlsx", EXCEL_MARKER),
        ("excel-to-pdf", "xls", EXCEL_MARKER),
        ("ppt-to-pdf", "pptx", PRESENTATION_MARKER),
        ("ppt-to-pdf", "ppt", PRESENTATION_MARKER),
        ("odt-to-pdf", "odt", WORD_MARKER),
        ("ods-to-pdf", "ods", EXCEL_MARKER),
        ("odp-to-pdf", "odp", PRESENTATION_MARKER),
        ("rtf-to-pdf", "rtf", RTF_MARKER),
        ("txt-to-pdf", "txt", TEXT_MARKER),
    ],
)
def test_real_conversion_returns_parseable_pdf_with_source_content(
    client: TestClient,
    source_fixtures: dict[str, Path],
    tool: str,
    extension: str,
    marker: str,
) -> None:
    response = _post_conversion(client, source_fixtures[extension], tool, extension)
    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content
    assert response.content[:5] == b"%PDF-"
    parsed = PdfReader(BytesIO(response.content), strict=True)
    assert len(parsed.pages) >= 1
    extracted = "".join((page.extract_text() or "") for page in parsed.pages)
    normalized = re.sub(r"\s+", "", extracted).lower()
    assert re.sub(r"\s+", "", marker).lower() in normalized


def _pdf_pages(response, *markers: str, artifact_name: str | None = None):
    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content
    assert response.content[:5] == b"%PDF-"
    artifact_dir = os.environ.get("PDFCONV_TEST_ARTIFACT_DIR")
    artifact_path = None
    if artifact_dir and artifact_name:
        artifact_path = Path(artifact_dir) / artifact_name
        artifact_path.parent.mkdir(parents=True, exist_ok=True)
        artifact_path.write_bytes(response.content)

    reader = PdfReader(BytesIO(response.content), strict=True)
    assert len(reader.pages) >= 1
    text_by_page = [page.extract_text() or "" for page in reader.pages]
    if artifact_path is not None:
        artifact_path.with_suffix(".txt").write_text(
            "\n\n".join(
                f"--- PDF page {index + 1} ---\n{text}"
                for index, text in enumerate(text_by_page)
            ),
            encoding="utf-8",
        )
    normalized_pages = [_compact_pdf_text(text) for text in text_by_page]
    for marker in markers:
        compact_marker = _compact_pdf_text(marker)
        assert any(compact_marker in page for page in normalized_pages), marker
    return reader, normalized_pages


def _assert_a4_page(page, landscape: bool) -> None:
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)
    expected = (841.89, 595.28) if landscape else (595.28, 841.89)
    actual = (width, height)
    assert abs(actual[0] - expected[0]) < 4, actual
    assert abs(actual[1] - expected[1]) < 4, actual


@pytest.mark.parametrize(
    ("fixture_key", "tool", "extension"),
    [
        ("wide_xlsx", "excel-to-pdf", "xlsx"),
        ("wide_xls", "excel-to-pdf", "xls"),
        ("wide_ods", "ods-to-pdf", "ods"),
    ],
)
def test_wide_spreadsheet_fits_all_print_area_columns_on_one_a4_landscape_page(
    client: TestClient,
    source_fixtures: dict[str, Path],
    fixture_key: str,
    tool: str,
    extension: str,
) -> None:
    response = _post_conversion(client, source_fixtures[fixture_key], tool, extension)
    reader, _ = _pdf_pages(
        response,
        "WIDE_COL_01",
        "WIDE_COL_14",
        "WIDE_VALUE_14",
        artifact_name=f"wide-{fixture_key}.pdf",
    )
    assert len(reader.pages) == 1
    _assert_a4_page(reader.pages[0], landscape=True)


def test_tall_spreadsheet_uses_multiple_a4_pages_without_vertical_fit_to_one(
    client: TestClient, source_fixtures: dict[str, Path]
) -> None:
    source_workbook = openpyxl.load_workbook(
        source_fixtures["tall_xlsx"], read_only=True, data_only=False
    )
    try:
        source_sheet = source_workbook["Tall report"]
        source_labels = [source_sheet.cell(row=row, column=1).value for row in range(1, 181)]
        source_indexes = [source_sheet.cell(row=row, column=2).value for row in range(1, 181)]
        assert source_labels == [f"TALL_ROW_{row:03d}" for row in range(1, 181)]
        assert source_indexes == list(range(1, 181))
    finally:
        source_workbook.close()

    response = _post_conversion(client, source_fixtures["tall_xlsx"], "excel-to-pdf", "xlsx")
    reader, _ = _pdf_pages(response, "TALL_ROW", artifact_name="tall-xlsx.pdf")
    extracted_pages = [page.extract_text() or "" for page in reader.pages]
    exported_row_numbers = sorted(
        int(match.group(1))
        for page_text in extracted_pages
        for match in re.finditer(r"TALL[ _]*ROW[ _]+0*(\d+)\b", page_text, re.IGNORECASE)
    )
    assert exported_row_numbers == list(range(1, 181)), exported_row_numbers
    assert len(reader.pages) > 1
    assert all(
        abs(float(page.mediabox.width) - 595.28) < 4
        and abs(float(page.mediabox.height) - 841.89) < 4
        for page in reader.pages
    )


def test_each_worksheet_gets_orientation_based_on_its_own_used_range(
    client: TestClient, source_fixtures: dict[str, Path]
) -> None:
    response = _post_conversion(client, source_fixtures["multi_xlsx"], "excel-to-pdf", "xlsx")
    reader, pages = _pdf_pages(
        response,
        "MULTI_PORTRAIT_MARKER",
        "MULTI_LANDSCAPE_MARKER",
        artifact_name="multi-sheet-xlsx.pdf",
    )
    portrait_indexes = [
        index for index, text in enumerate(pages)
        if _compact_pdf_text("MULTI_PORTRAIT_MARKER") in text
    ]
    landscape_indexes = [
        index for index, text in enumerate(pages)
        if _compact_pdf_text("MULTI_LANDSCAPE_MARKER") in text
    ]
    assert portrait_indexes and landscape_indexes
    excluded_marker = _compact_pdf_text("OUTSIDE_PRINT_AREA_SHOULD_NOT_APPEAR")
    assert all(excluded_marker not in text for text in pages)
    _assert_a4_page(reader.pages[portrait_indexes[0]], landscape=False)
    _assert_a4_page(reader.pages[landscape_indexes[0]], landscape=True)


def test_merged_cells_and_formatting_survive_spreadsheet_pdf_export(
    client: TestClient, source_fixtures: dict[str, Path]
) -> None:
    response = _post_conversion(client, source_fixtures["merged_xlsx"], "excel-to-pdf", "xlsx")
    reader, _ = _pdf_pages(
        response,
        "MERGED_FORMATTING_MARKER",
        "Styled data",
        "Blue fill and borders",
        artifact_name="merged-formatting-xlsx.pdf",
    )
    assert len(reader.pages) == 1
    _assert_a4_page(reader.pages[0], landscape=False)


def test_healthz_is_public_and_reports_ready(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_conversion_rejects_missing_and_invalid_bearer_tokens(
    client: TestClient, source_fixtures: dict[str, Path]
) -> None:
    fixture = source_fixtures["txt"]
    files = {"file": ("source.txt", fixture.read_bytes(), "text/plain")}
    data = {"toolSlug": "txt-to-pdf", "targetFormat": "pdf"}
    assert client.post("/convert", data=data, files=files).status_code == 401
    assert client.post(
        "/convert", headers={"Authorization": "Bearer wrong"}, data=data, files=files
    ).status_code == 401


def test_unconfigured_worker_fails_closed(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CONVERSION_WORKER_TOKEN")
    assert client.get("/healthz").status_code == 503
    response = client.post("/convert", headers={"Authorization": "Bearer arbitrary"})
    assert response.status_code == 503


def test_tool_extension_and_target_are_allowlisted(
    client: TestClient, source_fixtures: dict[str, Path]
) -> None:
    txt = source_fixtures["txt"].read_bytes()
    headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
    wrong_extension = client.post(
        "/convert",
        headers=headers,
        data={"toolSlug": "word-to-pdf", "targetFormat": "pdf"},
        files={"file": ("source.pdf", txt, "application/pdf")},
    )
    assert wrong_extension.status_code == 415

    wrong_target = client.post(
        "/convert",
        headers=headers,
        data={"toolSlug": "word-to-pdf", "targetFormat": "docx"},
        files={"file": ("source.docx", source_fixtures["docx"].read_bytes(), "application/octet-stream")},
    )
    assert wrong_target.status_code == 400

    unsupported_slug = client.post(
        "/convert",
        headers=headers,
        data={"toolSlug": "pdf-to-word", "targetFormat": "docx"},
        files={"file": ("source.pdf", txt, "application/pdf")},
    )
    assert unsupported_slug.status_code == 400


def test_malformed_office_input_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/convert",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"},
        data={"toolSlug": "word-to-pdf", "targetFormat": "pdf"},
        files={"file": ("broken.docx", b"not a DOCX package", "application/octet-stream")},
    )
    assert response.status_code == 422


def test_malformed_docx_xml_structure_is_rejected(client: TestClient) -> None:
    package_bytes = BytesIO()
    with zipfile.ZipFile(package_bytes, "w") as package:
        package.writestr(
            "[Content_Types].xml",
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
        )
        package.writestr("word/document.xml", "<not-a-word-document/>")

    response = client.post(
        "/convert",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"},
        data={"toolSlug": "word-to-pdf", "targetFormat": "pdf"},
        files={"file": ("broken.docx", package_bytes.getvalue(), "application/octet-stream")},
    )
    assert response.status_code == 422


def test_empty_input_is_rejected(client: TestClient) -> None:
    response = client.post(
        "/convert",
        headers={"Authorization": f"Bearer {TEST_TOKEN}"},
        data={"toolSlug": "txt-to-pdf", "targetFormat": "pdf"},
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert response.status_code == 400


def test_input_limit_is_enforced(
    client: TestClient,
    source_fixtures: dict[str, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(main, "MAX_INPUT_BYTES", 8)
    response = _post_conversion(client, source_fixtures["txt"], "txt-to-pdf", "txt")
    assert response.status_code == 413


def test_output_limit_is_enforced(
    client: TestClient,
    source_fixtures: dict[str, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(main, "MAX_OUTPUT_BYTES", 8)
    response = _post_conversion(client, source_fixtures["txt"], "txt-to-pdf", "txt")
    assert response.status_code == 413


def test_conversion_timeout_returns_504(
    client: TestClient,
    source_fixtures: dict[str, Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def hang(_input_path: Path, _work_path: Path) -> None:
        await asyncio.sleep(1)

    monkeypatch.setattr(main, "run_libreoffice", hang)
    monkeypatch.setattr(main, "CONVERSION_TIMEOUT_SECONDS", 0.01)
    response = _post_conversion(client, source_fixtures["txt"], "txt-to-pdf", "txt")
    assert response.status_code == 504


def test_concurrent_conversion_capacity_is_bounded(
    source_fixtures: dict[str, Path], monkeypatch: pytest.MonkeyPatch
) -> None:
    sample_pdf = source_fixtures["sample_pdf"]

    async def delayed_conversion(_input_path: Path, work_path: Path) -> None:
        await asyncio.sleep(0.5)
        shutil.copyfile(sample_pdf, work_path / "input.pdf")

    monkeypatch.setattr(main, "run_libreoffice", delayed_conversion)
    barrier = threading.Barrier(3)
    text_bytes = source_fixtures["txt"].read_bytes()

    def submit() -> int:
        barrier.wait(timeout=5)
        with TestClient(main.app) as test_client:
            result = test_client.post(
                "/convert",
                headers={"Authorization": f"Bearer {TEST_TOKEN}"},
                data={"toolSlug": "txt-to-pdf", "targetFormat": "pdf"},
                files={"file": ("source.txt", text_bytes, "text/plain")},
            )
            return result.status_code

    with ThreadPoolExecutor(max_workers=3) as executor:
        statuses = list(executor.map(lambda _index: submit(), range(3)))
    assert statuses.count(429) >= 1
    assert statuses.count(200) >= 1


def test_registry_allowlist_has_nine_requested_tools_and_exact_pairs() -> None:
    assert main.SUPPORTED_CONVERSIONS == {
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

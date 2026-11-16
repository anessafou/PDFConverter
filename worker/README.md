# PDFConverter conversion worker

This service converts the nine allowlisted Office, OpenDocument, RTF, and plain-text tools to real PDF files with LibreOffice. It is intended to sit behind the existing Next.js `POST /api/convert` proxy. It does not implement the other worker-routed tools.

Spreadsheet conversions (`.xlsx`, `.xls`, and `.ods`) use a Calc UNO export helper. The confirmed unsupported Calc `PaperFormat` property access has been replaced with metadata-checked A4 `Width`/`Height` values; fit-to-one-page-wide, unlimited vertical pagination, width-based orientation, and print-area preservation remain configured. The correction is awaiting a fresh Docker test run. Extremely wide sheets may also become hard to read when scaled to fit.

## API

- `GET /healthz` is unauthenticated and returns `{"status":"ok"}` only when LibreOffice is present and `CONVERSION_WORKER_TOKEN` is configured with at least 32 characters. Otherwise it returns HTTP 503.
- `POST /convert` requires `Authorization: Bearer <CONVERSION_WORKER_TOKEN>` and multipart fields `file`, `toolSlug`, and `targetFormat`. Only the exact tool/extension pairs in [worker allowlist](app/main.py#L40) are accepted; every output is PDF.
- Input is limited to 25 MiB, output to 100 MiB, conversion time to 105 seconds, and active conversions to two per process. The Next.js proxy has a 120-second worker timeout and also validates response size and PDF signature.

Errors use JSON `{"detail":"..."}` responses. Unsupported tools/targets return 400, unsupported source extensions 415, invalid documents 422, size violations 413, unavailable engine/storage 503, timeout 504, and capacity exhaustion 429. The worker does not return the uploaded input as a converted file.

## Build and run

Use a high-entropy random token of at least 32 characters. Keep it in the deployment secret store; never bake it into the image or commit it.

```sh
docker build --target runtime -t pdfconverter-worker:local worker
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e CONVERSION_WORKER_TOKEN="$CONVERSION_WORKER_TOKEN" \
  --memory=1g --cpus=2 --pids-limit=128 \
  pdfconverter-worker:local
```

Set the Next.js deployment's `CONVERSION_WORKER_URL` to the worker base URL (without `/convert`) and set `CONVERSION_WORKER_TOKEN` to the same secret. Do not change production settings as part of this repository change. The worker listens on `0.0.0.0:$PORT` and uses a single Uvicorn process; scale by running multiple isolated containers behind an authenticated/private network endpoint. Configure platform request and instance limits as well as the container limits shown above.

## Tests

The Docker test target contains real source fixtures and invokes LibreOffice to derive legacy Office and OpenDocument variants. It runs actual conversions and parses the resulting PDFs to verify signatures, pages, and source text. Spreadsheet layout cases cover wide XLSX/XLS/ODS, tall data, per-sheet orientation, and merged/formatted cells.

```sh
docker build --target test -t pdfconverter-worker-tests:local worker
docker run --rm pdfconverter-worker-tests:local
```

These commands require a working Docker Linux engine. The Python test dependencies and application dependencies are exactly pinned in `requirements-test.txt` and `requirements.txt`; the Python base image is pinned to a patch release tag. Debian package versions are obtained from the configured Debian repository at image-build time and are not content-addressed here, so fully bit-for-bit OS dependency reproducibility requires a Debian snapshot or pinned image digest/package versions.

## Security and operating notes

- Run only as the non-root `worker` user supplied by the image.
- Use TLS and preferably private networking between Next.js and this service. Bearer authentication is required for conversion requests.
- Uploaded filenames never become command arguments or output paths. The worker uses fixed local names in isolated per-job temporary directories and invokes LibreOffice without a shell.
- The uploaded documents are processed in temporary storage. Once a validated PDF has been read into the response, the job directory is removed before the response is sent; errors also clean it up. Access logging is disabled and document content is not logged.
- The 25 MiB and 100 MiB limits are enforced in the application; the response body is buffered in memory, so budget for up to 200 MiB of PDF response bytes at the default two-request concurrency, plus runtime overhead. Apply container memory, CPU, PID, disk, and request-rate limits at the platform/network layer too. A timeout or post-conversion output-size check is not a substitute for OS-level resource isolation.
- LibreOffice is a complex document parser. Keep the image patched, restrict ingress, avoid exposing this service publicly without TLS/rate limiting, and consider stronger per-job OS/container isolation for hostile uploads.

## Scope and status

Code and conversion tests are implemented for the nine tool slugs, covering twelve accepted source-format pairs. They are **not yet verified in this environment** until the Docker image and integration test suite run successfully against LibreOffice. The application source, browser-side conversion code, tool registry, routes, SEO configuration, and deployment settings are not changed by this worker package.

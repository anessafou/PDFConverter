FROM python:3.12.16-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080 \
    WORKER_TMP_DIR=/tmp/pdfconverter-worker

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        fontconfig \
        fonts-crosextra-caladea \
        fonts-crosextra-carlito \
        fonts-dejavu-core \
        fonts-liberation \
        libreoffice-calc \
        libreoffice-impress \
        libreoffice-writer \
        python3-uno \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 worker \
    && useradd --system --uid 10001 --gid worker --home-dir /nonexistent --shell /usr/sbin/nologin worker \
    && mkdir -p /tmp/pdfconverter-worker \
    && chown worker:worker /tmp/pdfconverter-worker

COPY requirements.txt /app/requirements.txt
RUN python -m pip install --only-binary=:all: -r /app/requirements.txt

FROM base AS test
COPY requirements-test.txt /app/requirements-test.txt
RUN python -m pip install --only-binary=:all: -r /app/requirements-test.txt
COPY --chown=worker:worker app/ /app/app/
COPY --chown=worker:worker tests/ /app/tests/
USER worker
CMD ["python", "-m", "pytest", "-q", "tests"]

FROM base AS runtime
COPY --chown=worker:worker app/ /app/app/
USER worker
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD ["python", "-c", "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.getenv('PORT','8080')+'/healthz',timeout=2)"]
CMD ["python", "-m", "app.server"]

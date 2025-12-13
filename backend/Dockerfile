# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

# Copy and install dependencies first (cached layer)
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

# Copy application code (separate layer)
COPY app/ ./app/

# Copy .env if it exists (optional for production)
COPY .env* ./

# Environment variables for configuration
ENV HOST=0.0.0.0
ENV PORT=8000
ENV LOG_LEVEL=info

EXPOSE ${PORT}

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info", "--access-log"]
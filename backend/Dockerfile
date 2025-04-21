FROM python:3.11-alpine

RUN apk add --no-cache gcc musl-dev libpq
RUN pip install --no-cache-dir uv         # Paket‑Manager

WORKDIR /app
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

COPY app ./app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

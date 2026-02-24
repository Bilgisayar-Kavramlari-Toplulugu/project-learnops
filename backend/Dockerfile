FROM python:3.13.11-slim

WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Poetry kur
RUN pip install poetry==2.3.2

# Bağımlılık dosyalarını kopyala
COPY pyproject.toml poetry.lock* ./

# Bağımlılıkları kur (venv olmadan, direkt sisteme)
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-interaction --no-ansi

# Kaynak kodu kopyala
COPY . .

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
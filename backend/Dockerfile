FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıklarını kur
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python kütüphanelerini kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kodları kopyala
COPY . .

# Entrypoint script'i kopyala ve executable yap
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Uygulamayı başlat (migration + server)
ENTRYPOINT ["/app/entrypoint.sh"]
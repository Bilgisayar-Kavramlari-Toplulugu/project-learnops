FROM python:3.13-slim

WORKDIR /app

# system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install poetry==2.3.2

# Poetry config (kritik fix)
RUN poetry config virtualenvs.create false \
    && poetry config installer.max-workers 10

COPY pyproject.toml poetry.lock* ./

RUN poetry install --only main --no-interaction --no-ansi --no-root

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

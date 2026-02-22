#!/bin/sh
set -e

echo "🔄 Running database migrations..."
alembic upgrade head

echo "✅ Database is ready!"
echo "🚀 Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

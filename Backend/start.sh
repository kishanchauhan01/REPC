#!/bin/sh

echo "⏳ Waiting for database..."

until pg_isready -h postgres -U postgres
do
  sleep 1
done

echo "✅ Database ready"

echo "🚀 Running migrations..."

npm run migrate

echo "🔥 Starting server..."

npm run dev
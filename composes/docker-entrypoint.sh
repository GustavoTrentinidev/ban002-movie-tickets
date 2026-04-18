#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set."
  exit 1
fi

echo "Running database migrations (if pending)..."
npx prisma migrate deploy

exec "$@"

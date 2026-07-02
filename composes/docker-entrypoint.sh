#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set."
  exit 1
fi

echo "Syncing MongoDB schema/indexes (if pending)..."
npx prisma db push --skip-generate

echo "Seeding default data (if the database is empty)..."
npx prisma db seed

exec "$@"

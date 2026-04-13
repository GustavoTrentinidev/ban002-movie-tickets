This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Collage project. 

First, start a postgres manually or by the docker-compose.yml file with:
```bash
docker compose up -d
```

Create a .env file with the DATABASE_URL variable.
```bash
touch .env
echo 'DATABASE_URL=<your_db_url>' > .env
# your_db_url example: postgresql://postgres:postgres@localhost:5432/postgres?schema=public
```

Install dependencies:
```bash
npm install
```

Run the app:
```bash
npm run dev
```

Run database migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
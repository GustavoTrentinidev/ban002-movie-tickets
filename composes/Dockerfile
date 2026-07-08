FROM node:20.20.2-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
ARG DATABASE_URL
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/movietickets
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN chmod +x ./composes/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./composes/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]

# Build

FROM node:18-alpine AS base

WORKDIR /app

COPY . /app/

RUN npm pkg delete scripts.prepare

RUN npm ci
RUN npm run build

# Production

FROM node:18-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=base /app/dist /app/dist

RUN npm ci

CMD ["node", "dist/index", "--env", "/app/.env", "--config", "/app/config.yaml"]

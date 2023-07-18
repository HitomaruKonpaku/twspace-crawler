# Build

FROM node:18-alpine AS base

WORKDIR /app

COPY . /app/

RUN npm ci
RUN npm run build

# Production

FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json .
COPY --from=base /app/package-lock.json .

RUN npm ci

CMD ["node", "/app/dist/index.js", "--env", "/app/.env", "--config", "/app/config.yaml"]

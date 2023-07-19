# Build

FROM node:18-alpine AS base

WORKDIR /app

COPY . /app/

RUN npm ci
RUN npm run build

RUN npm i -g pkg
RUN pkg dist/index.js -o twspace

# Production

FROM alpine

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=base /app/twspace /app/

RUN npm ci

CMD ["./twspace", "--env", "/app/.env", "--config", "/app/config.yaml"]

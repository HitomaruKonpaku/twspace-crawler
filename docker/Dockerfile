# BASE
FROM node:lts-alpine AS base

RUN apk add --no-cache tini

WORKDIR /app

COPY package*.json ./

RUN npm pkg delete scripts.prepare

# DEPENDENCIES
FROM base AS dependencies

RUN npm ci --omit=dev

# BUILDER
FROM base AS builder

RUN npm ci

COPY . .

RUN npm run build

# RELEASE
FROM base AS release

ENV NODE_ENV=production

VOLUME /app/logs
VOLUME /app/download

RUN apk add --no-cache bash
RUN apk add --no-cache ffmpeg

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder      /app/dist ./dist

RUN npm link

ENTRYPOINT [ "/sbin/tini", "--", "node", "dist/index" ]

CMD [ "--config", "/app/config.yaml" ]

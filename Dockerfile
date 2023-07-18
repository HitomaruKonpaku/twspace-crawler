FROM node:18-alpine

WORKDIR /app

COPY . /app/

RUN apk add --no-cache ffmpeg

RUN npm i -g twspace-crawler

ENV NODE_ENV=production

CMD ["twspace-crawler", "--env", "/app/.env", "--config", "/app/config.yaml"]

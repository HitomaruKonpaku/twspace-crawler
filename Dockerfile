FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY . /app/

RUN npm i -g twspace-crawler

ENV NODE_ENV=production

CMD ["twspace-crawler", "--env", "/app/.env", "--config", "/app/config.yaml"]

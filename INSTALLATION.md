# Installation

## Node.js (>=14)

- Windows

  <https://nodejs.org/en/>

- Linux

  <https://linuxize.com/post/how-to-install-node-js-on-ubuntu-20-04/>

  ```
  curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
  ```

  ```
  sudo apt install nodejs
  ```

## FFMPEG

- Windows

  <https://www.geeksforgeeks.org/how-to-install-ffmpeg-on-windows/>

- Linux

  <https://linuxize.com/post/how-to-install-ffmpeg-on-ubuntu-20-04/>

  ```
  sudo apt update
  sudo apt install ffmpeg
  ```

## twspace-crawler

- Install `twspace-crawler`

  ```
  npm i -g twspace-crawler
  ```

- Clone/Create [.env](.env.example) file

  ```
  TWITTER_AUTHORIZATION=
  TWITTER_AUTH_TOKEN=
  ```

  - You need to set 1 of them for better Spaces look up

  - `TWITTER_AUTHORIZATION`

    1. [Getting access to the Twitter API](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api)
    1. Navigate to [Projects & Apps](https://developer.twitter.com/en/portal/projects-and-apps) to create new app (or use existing app)
    1. Get app `Bearer Token` in `Keys and tokens` tab
    1. Set `TWITTER_AUTHORIZATION` value

        ```
        TWITTER_AUTHORIZATION=Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs...
        ```

  - `TWITTER_AUTH_TOKEN`

    1. Sign in Twitter
    1. Open new tab (Chrome)

        ```
        chrome://settings/cookies/detail?site=twitter.com&search=cookies
        ```

    1. Copy `Content` of `auth_token`
    1. Set `TWITTER_AUTH_TOKEN` value

        ```
        TWITTER_AUTH_TOKEN=456472d2...
        ```

- Clone/Create [config.yaml](config.example.yaml) or [config.json](config.example.json) file

- Start app

  ```
  twspace-crawler --env ./.env --config ./config.json --force-open
  ```

## twspace-crawler with pm2

- Install [pm2](https://pm2.keymetrics.io/)

  ```
  npm i -g pm2
  ```

- Clone/Create [ecosystem.config.js](ecosystem.config.js) file

  ```
  module.exports = {
    apps: [
      {
        name: 'twspace-crawler',
        script: 'twspace-crawler',
        args: '--env ./.env --config ./config.json --force-open',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  }
  ```

- Start app

  ```
  pm2 start ecosystem.config.js
  ```

<https://pm2.keymetrics.io/docs/usage/startup/>

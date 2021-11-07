# twspace-crawler

## Description

Script to crawl & download Twitter Spaces.

## Requirements

- [ffmpeg](https://www.ffmpeg.org/)

## Usage

```
node ./dist/index.js --user nakiriayame
```

```
node ./dist/index.js --config ./config.json
```

## Arguments

```
  --debug         Show debug logs
  --config        CONFIG_PATH
                  Path to config file (Check sample config.json)
  --user          USER_LIST
                  Watch & get Spaces from users to download, separate by comma (,)
  --id            SPACE_ID
                  Watch & wait for specific Space with id to complete & download
  --force         Force download Space when using with --id
  --url           PLAYLIST_URL
                  Download Space with playlist url
  --notification  Show native notification about live Space using node-notifier (Windows, iOS...)
```

## Advance Usage

- To watch multiple users, it is better to use [Twitter API](https://developer.twitter.com/en/docs/twitter-api/spaces/overview)
    1. Clone `.env.example` and rename to `.env`
    2. Get `Bearer Token` ([Docs](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api))
    3. Set `TWITTER_AUTHORIZATION` value to `Bearer Token` value
       ```
       TWITTER_AUTHORIZATION = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs..."
       ```

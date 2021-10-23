# twspace-crawler

Script to crawl & download twitter space.

## Usage

```
node ./dist/index.js --user nakiriayame
```

## Arguments

```
  --config        CONFIG_PATH
                  Path to config file (Check sample config.json)
  --user          USER
                  Watch & get space from users to download, separate by comma (,)
  --id            SPACE_ID
                  Watch & wait for specific space id to complete & download
  --force         Use combine with --id to force download instead of waiting
  --url           PLAYLIST_URL
                  Download space with playlist url
  --notification  Show native notification about live space using node-notifier
```

## Advance Usage

- To watch multiple users, it is better to use [Twitter API](https://developer.twitter.com/en/docs/twitter-api/spaces/overview)
    1. Get `Bearer Token` ([Docs](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api))
    2. Open `.env` & set `TWITTER_AUTHORIZATION` value to `Bearer Token`
       ```
       TWITTER_AUTHORIZATION = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs..."
       ```

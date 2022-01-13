# twspace-crawler

## Description

Script to crawl & download Twitter Spaces.

## Note

- Please set `TWITTER_AUTHORIZATION` or `TWITTER_AUTH_TOKEN` for better Spaces lookup
- Without above config, script will try to fetch user tweets for live Spaces, which could result empty if user not tweet that Space

## Requirements

- [Node 14](https://nodejs.org/)
- [ffmpeg](https://www.ffmpeg.org/)

## Installation

```
npm install
```

```
npm run build
```

## Usage

Monitor user(s) indefinitely, wait for live Space and download when Space ended

```
node ./dist/index.js --user nakiriayame
```

```
node ./dist/index.js --user nakiriayame,sakamatachloe
```

```
node ./dist/index.js --config ./config.json
```

Monitor & download Space by id

```
node ./dist/index.js --id 1yoJMWvbybNKQ
```

Download Space by playlist url

```
node ./dist/index.js --url https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw...
```

Download Space by playlist url with additional metadata (if Space url still available)

```
node ./dist/index.js --id 1yoJMWvbybNKQ --url https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw...
```

## Options

```
  -h, --help                Display help
  -d, --debug               Show debug logs

  --config <CONFIG_PATH>    Load config file (Check config.json)
  --user <USER>             Monitor & download live Spaces from users indefinitely,
                            separate by comma (,)
  --id <SPACE_ID>           Monitor & download live Space with id
  --force                   Force download Space when using with --id
  --url <PLAYLIST_URL>      Download Space using playlist url

  --notification            Show notification about new live Space
```

## Commands

Use to manually process audio/captions

### List

- cc

```
  download|d <SPACE_ID> <ENDPOINT> <TOKEN>  Download Space captions, with
                                            - ENDPOINT: Chat endpoint
                                            - TOKEN: Chat access token

  extract|e <FILE>                          Extract Space captions
```

### Example

```
node ./dist/index.js cc d 1yoJMWneoZwKQ https://prod-chatman-ancillary-ap-northeast-1.pscp.tv 2Ozpcu2xxqb5wxMdkyodUCygOrbYMLv8rq...
```

```
node ./dist/index.js cc e /download/sample_cc.jsonl
```

## Advanced Usage

- To monitor multiple users, it is better to use [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api/spaces/overview)
    1. [Getting access to the Twitter API](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api)
    2. Navigate to [Projects & Apps](https://developer.twitter.com/en/portal/projects-and-apps) to create new app (or use existing app)
    3. Clone `config.example.json` and rename to `config.json` and run app with `--config`
    4. Clone `.env.example` and rename to `.env`
    5. Get app `Bearer Token` in `Keys and tokens` tab
    6. Set `TWITTER_AUTHORIZATION` value to `Bearer Token` value

       ```
       TWITTER_AUTHORIZATION = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs..."
       ```

- How to get `TWITTER_AUTH_TOKEN`
  1. Sign in Twitter
  2. Open new tab (Chrome)

     ```
     chrome://settings/cookies/detail?site=twitter.com&search=cookies
     ```

  3. Copy `Content` of `auth_token`

## Webhooks

Currently support Discord Webooks

Check `config.example.json` for more detail

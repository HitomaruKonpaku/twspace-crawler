# twspace-crawler

## Description

Script to crawl & download Twitter Spaces.

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

Download live Space with audio & captions

```
node ./dist/index.js --id 1yoJMWneoZwKQ
```

Monitor user(s) indefinitely, wait for live Space and download

```
node ./dist/index.js --user nakiriayame
```

```
node ./dist/index.js --config ./config.json
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

## Advance Usage

- To monitor multiple users, it is better to use [Twitter API](https://developer.twitter.com/en/docs/twitter-api/spaces/overview)
    1. Clone `.env.example` and rename to `.env`
    2. Get `Bearer Token` ([Docs](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api))
    3. Set `TWITTER_AUTHORIZATION` value to `Bearer Token` value

       ```
       TWITTER_AUTHORIZATION = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs..."
       ```

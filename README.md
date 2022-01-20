# twspace-crawler

> **Node.js script & command-line app to automatically monitor & download [Twitter Spaces](https://help.twitter.com/en/using-twitter/spaces).**

## Note

- Please set `TWITTER_AUTHORIZATION` or `TWITTER_AUTH_TOKEN` for better Spaces lookup
- Without above config, script will try to fetch user tweets for live Spaces, which could result empty if user not tweet that Space

## Contents

1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Options](#options)
1. [Commands](#commands)
1. [Advanced Usage](#advanced-usage)
1. [Webhooks](#webhooks)

## Requirements

- [Node 14](https://nodejs.org/) ([Ubuntu](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-20-04/))
- [ffmpeg](https://www.ffmpeg.org/) ([Ubuntu](https://linuxize.com/post/how-to-install-ffmpeg-on-ubuntu-20-04/))

## Installation

### Command-line installation

```bash
npm install --global twspace-crawler
```

### Module installation

```bash
npm install twspace-crawler
```

## Usage

### Monitor user(s) indefinitely, wait for live Space and download when Space ended

```
twspace-crawler --user nakiriayame
```

```
twspace-crawler --user nakiriayame,sakamatachloe
```

```
twspace-crawler --config ./config.json

```

### Monitor & download Space by id

```
twspace-crawler --id 1yoJMWvbybNKQ
```

### Download Space by playlist url

```
twspace-crawler --url https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw...
```

### Download Space by playlist url with additional metadata (if Space url still available)

```
twspace-crawler --id 1yoJMWvbybNKQ --url https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw...
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
  --force-open              Force open Space in browser
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
twspace-crawler cc d 1yoJMWneoZwKQ https://prod-chatman-ancillary-ap-northeast-1.pscp.tv 2Ozpcu2xxqb5wxMdkyodUCygOrbYMLv8rq...
```

```
twspace-crawler cc e /download/sample_cc.jsonl
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

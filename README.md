# twspace-crawler

[![npm](https://img.shields.io/npm/v/twspace-crawler)](https://www.npmjs.com/package/twspace-crawler)
[![npm](https://img.shields.io/npm/dt/twspace-crawler)](https://www.npmjs.com/package/twspace-crawler)

> **Node.js script & command-line app to automatically monitor & download [Twitter Spaces](https://help.twitter.com/en/using-twitter/spaces).**

## Contents

1. [Requirements](#requirements)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Options](#options)
1. [Commands](#commands)
1. [Webhooks](#webhooks)
1. [Changelog](CHANGELOG.md)

## Requirements

- [Node.js](https://nodejs.org) (>=14)
- [FFMPEG](https://www.ffmpeg.org)

## Installation

[FULL INSTALLATION](INSTALLATION.md)

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
twspace-crawler --env ./.env --config ./config.json
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

### General options

```
  -h, --help                        Display help
  -d, --debug                       Show debug logs
```

### One-time download options

```
  --id <SPACE_ID>                   Monitor & download live Space with its id
  -surl, --space-url <SPACE_URL>    Monitor & download live Space with its URL
  --force                           Force download Space when using with --id
  --url <PLAYLIST_URL>              Download Space using playlist url
```

### User monitoring options

```
  --env <ENV_PATH>                  Path to .env file, default to current working
                                    folder (See .env.example)
  --config <CONFIG_PATH>            Path to config file (See config.example.json)
  --user <USER>                     Monitor & download live Spaces from users
                                    indefinitely, separate by comma (,)
```

### Additional options

```
  --notification                    Show notification about new live Space
  --force-open                      Force open Space in browser
```

## Commands

Use to manually process audio/captions

### List

- cc

```
  download|d <SPACE_ID> <ENDPOINT> <TOKEN>  Download Space captions, with
                                            - ENDPOINT: Chat endpoint
                                            - TOKEN: Chat access token

  extract|e <FILE> [STARTED_AT]             Extract Space captions
```

### Example

```
twspace-crawler cc d 1yoJMWneoZwKQ https://prod-chatman-ancillary-ap-northeast-1.pscp.tv 2Ozpcu2xxqb5wxMdkyodUCygOrbYMLv8rq...
```

```
twspace-crawler cc e /download/sample_cc.jsonl
```

```
twspace-crawler cc e /download/sample_cc.jsonl 1633612289669
```

## Webhooks

Currently support Discord Webooks

Check [config.example.yaml](config.example.yaml) or [config.example.json](config.example.json) for more detail

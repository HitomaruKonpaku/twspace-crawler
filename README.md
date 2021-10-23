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

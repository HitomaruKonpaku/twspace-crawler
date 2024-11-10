# Changelog

## 1.14.1

* Trim caption body

## 1.14.0

* Add env/config to skip download (audio and/or caption) (#82)

## 1.13.0

* Update docker build
* Fix API auth
* Add log to save raw space metadata
* Update webhook embed
* Add [example](./example/)
* Update [README](./README.md)

## 1.12.9

* Allow passing extra ffmpeg args from config file (#66) (9b07325)

## 1.12.8

* Fix API auth

## 1.12.7

* Allow audio space from multiple source
* Fix mapping error

## 1.12.6

* Fix error related to Space of suspended user
* Enable webhook
* Update Dockerfile

## 1.12.5

* Use new AudioSpace API
* Disable webhook

## 1.12.4

* Fix AudioSpace API

## 1.12.3

* Update user request queue on init to adapt new API limit (50req/15mins)

## 1.12.2

* Update webhook embed
* Handle Space ended/canceled case

## 1.12.1

* Minor fix

## 1.12.0

* Fix APIs now remove guest token, required user auth token & csrf token
* Update webhook embed
* Update README

## 1.11.12

* Fix Space ended embed title
* Update AudioSpace endpoint

## 1.11.11

* Send Space ended webhook
* Update webhook payload
* Add webhook config for message content (See [config.example.yaml](config.example.yaml))
  * `startMessage`
  * `endMessage`
* To remove webhook `mentions` config

## 1.11.10

* Fix download not start with `ENDED` archived Space (#30)

## 1.11.9

* Fix 429 error on tracking more than 100 users with official API
* Disable child process detached

## 1.11.8

* Skip m3u8 download, feed master url directly to `ffmpeg`
* Update Webhook payload
  * Detect user as host/co-host/speaker/listener
  * Add relative time (See [HammerTime](https://hammertime.cyou))

## 1.11.7

* Allow string in config `users` object
* Accept config as YAML file (See [config.example.yaml](config.example.yaml))
* Use different API to get user info which reduce response time (3a6abcb)

## 1.11.6

* Add new option `--space-url` (alternative to `--id`)
* Fix user undefined when Space ended (#22)
* Fix error when using api `UserTweets`

## 1.11.5

* Fix error on empty user result (deactive/delete)
* Improve logger

## 1.11.4

* Fix Space state detection when host disconnect
* Minor change on Discord webhook

## 1.11.3

* Fix error on final playlist response with HTTP 404

## 1.11.2

* Check for latest version on start up
* Show expected audio duration base on Space metadata
* Reduce amount of info log of captions downloader
* Update Discord webhook data

## 1.11.1

* Fix users lookup response undefined when no user found

## 1.11.0

* Add timestamp to caption file
* Add CHANGELOG, INSTALLATION
* Update README

## 1.10.0

* Add twspace-crawler as a global command-line executable

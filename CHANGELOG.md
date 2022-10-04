# Changelog

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

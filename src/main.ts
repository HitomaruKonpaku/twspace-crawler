import 'dotenv/config'
import fs from 'fs'
import { args } from './args'
import { config } from './config'
import { Downloader } from './Downloader'
import logger from './logger'
import { SpaceWatcher } from './SpaceWatcher'
import { UserWatcher } from './UserWatcher'
import { Util } from './Util'

class Main {
  private userWatchers: Record<string, UserWatcher> = {}
  private spaceWatchers: Record<string, SpaceWatcher> = {}

  public async start() {
    logger.info('[MAIN] Starting...')
    logger.info(args)

    let externalConfig: Record<string, any> = {}
    if (args.config) {
      try {
        externalConfig = JSON.parse(fs.readFileSync(args.config, 'utf-8'))
      } catch (error) {
        logger.error(`Failed to read config: ${error.message}`)
      }
    }

    const interval = Number(args.interval) || config.app.userRefreshInterval
    config.app.userRefreshInterval = interval

    const users = (args.user || '').split(',')
      .concat((externalConfig.users || []).map((v) => v.screenName))
      .filter((v) => v)
    if (users.length) {
      logger.info({ args: { users } })
      users.forEach((user) => this.addUserWatcher(user))
    }

    const { id } = args
    if (id) {
      logger.info({ args: { id } })
      this.addSpaceWatcher(id)
    }

    const { url } = args
    if (url) {
      logger.info({ args: { url } })
      await Downloader.downloadMedia(url, Util.getTimeString())
    }
  }

  private addUserWatcher(username: string) {
    const watchers = this.userWatchers
    if (watchers[username]) {
      return
    }
    const watcher = new UserWatcher(username)
    watchers[username] = watcher
    watcher.watch()
    watcher.on('data', (id) => {
      this.addSpaceWatcher(id)
    })
  }

  private addSpaceWatcher(spaceId: string) {
    const watchers = this.spaceWatchers
    if (watchers[spaceId]) {
      return
    }
    const watcher = new SpaceWatcher(spaceId)
    watchers[spaceId] = watcher
    watcher.watch()
  }
}

new Main().start()

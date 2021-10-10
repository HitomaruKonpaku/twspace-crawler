import * as dotenv from 'dotenv'
import { args } from './args'
import logger from './logger'
import util from './util'
import { Watcher } from './watcher'

async function bootstrap() {
  dotenv.config()
  logger.info({ args })

  const watchers: Watcher[] = []
  util.makeMediaDir()

  const url = args.url
  if (url) {
    try {
      const fileName = Date.now()
      await util.downloadPlaylist(url, String(fileName))
      return
    } catch (error) {
      logger.error({ msg: error.message })
      debugger
    }
  }

  const getTweetSpace = async () => {
    try {
      const user: string = args.user
      let id: string = args.id
      if (!id && !user) {
        logger.error('require user or id arg')
        return
      }

      const interval = Number(args.interval)
      if (!id && user) {
        id = await util.getTweetSpaceIdByTweetSpaces(user)
      }
      if (!id) {
        if (isNaN(interval)) {
          logger.error(`spaceId not found: ${id || user}`)
          return
        }
        logger.silly(`spaceId not found: ${id || user}, retry in ${interval}ms`)
        if (user && !isNaN(interval)) {
          setTimeout(() => getTweetSpace(), interval)
        }
        return
      }

      if (user && !isNaN(interval)) {
        setTimeout(() => getTweetSpace(), interval)
      }
      if (watchers.find(v => v.spaceId === id)) {
        return
      }

      const watcher = new Watcher(id)
      watchers.push(watcher)
      watcher.start()
    } catch (error) {
      logger.error({ msg: error.message })
      debugger
    }
  }

  getTweetSpace()
}

bootstrap()

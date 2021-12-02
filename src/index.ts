import 'dotenv/config'
import { Downloader } from './Downloader'
import { logger } from './logger'
import { Main } from './Main'
import { program } from './program'
import { SpaceCaptionsExtractor } from './SpaceCaptionsExtractor'
import { Util } from './Util'

program
  .action(async (args) => {
    logger.debug('args', args)

    if (args.extractCc) {
      const file = args.extractCc
      new SpaceCaptionsExtractor().extract(
        file,
        file.replace('.jsonl', '.txt'),
      )
      return
    }

    const { url } = args
    if (url) {
      logger.info('Starting in url mode', { url })
      await Downloader.downloadSpace(url, Util.getTimeString())
      return
    }

    const main = new Main()
    const { id } = args
    if (id) {
      logger.info('Starting in space id mode', { id })
      main.addSpaceWatcher(id)
      return
    }

    const externalConfig = Util.getExternalConfig()
    const users = (args.user || '').split(',')
      .concat((externalConfig.users || []).map((v) => v.username))
      .filter((v) => v)
    if (users.length) {
      logger.info('Starting in user mode', { users })
      if (!Util.getTwitterAuthorization()) {
        users.forEach((user) => main.addUserWatcher(user))
      } else {
        main.runUserListWatcher(users)
      }
    }
  })
  .parse()

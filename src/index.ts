import { program } from 'commander'
import 'dotenv/config'
import { ccCommand } from './commands/cc.command'
import { Downloader } from './Downloader'
import { logger } from './logger'
import { manager } from './manager'
import { Util } from './Util'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json')

program
  .version(pkg.version)
  .description('Script to crawl & download Twitter Spaces.')
  .option('-d, --debug', 'Show debug logs')
  .option('--config <CONFIG_PATH>', 'Load config file (Check config.json)')
  .option('--user <USER>', 'Watch & download live Spaces from users, separate by comma (,)')
  .option('--id <SPACE_ID>', 'Watch & download live Space with id')
  .option('--force', 'Force download Space when using with --id')
  .option('--url <PLAYLIST_ID>', 'Download Space using playlist url')
  .option('--notification', 'Show notification about new live Space')
  .addCommand(ccCommand)

program.action(async (args) => {
  if (args.debug) {
    // eslint-disable-next-line dot-notation
    const transports = logger.transports.filter((v) => v['name'] === 'console')
    transports.forEach((transport) => {
      // eslint-disable-next-line no-param-reassign
      transport.level = 'silly'
    })
  }

  logger.debug('Args', args)

  const { url, id, user } = args
  if (url) {
    logger.info('Starting in url mode', { url })
    await Downloader.downloadSpace(url, Util.getTimeString())
    return
  }

  if (id) {
    logger.info('Starting in space id mode', { id })
    manager.addSpaceWatcher(id)
    return
  }

  const externalConfig = Util.getExternalConfig()
  const usernames = (user || '').split(',')
    .concat((externalConfig.users || []).map((v) => v.username))
    .filter((v) => v) as string[]
  if (usernames.length) {
    logger.info('Starting in user mode', { users: usernames })
    if (!Util.getTwitterAuthorization()) {
      usernames.forEach((username) => manager.addUserWatcher(username))
    } else {
      manager.runUserListWatcher(usernames)
    }
  }
})

program.parse()

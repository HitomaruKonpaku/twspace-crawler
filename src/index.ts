import { program } from 'commander'
import 'dotenv/config'
import { ccCommand } from './commands/cc.command'
import { testCommand } from './commands/test.command'
import { logger } from './logger'
import { configManager } from './modules/ConfigManager'
import { mainManager } from './modules/MainManager'
import { SpaceDownloader } from './modules/SpaceDownloader'
import { userManager } from './modules/UserManager'
import { Util } from './utils/Util'

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
  .option('--force-open', 'Force open Space in browser')
  .addCommand(ccCommand)
  .addCommand(testCommand)

program.action(async (args) => {
  logger.info(Array(80).fill('=').join(''))
  if (args.debug) {
    // eslint-disable-next-line dot-notation
    const transports = logger.transports.filter((v) => v['name'] === 'console')
    transports.forEach((transport) => {
      // eslint-disable-next-line no-param-reassign
      transport.level = 'silly'
    })
  }

  logger.debug('Args', args)
  configManager.load()

  const { url, id, user } = args
  if (url && !id) {
    logger.info('Starting in url mode', { url })
    new SpaceDownloader(url, Util.getTimeString()).download()
    return
  }

  if (id) {
    logger.info('Starting in space id mode', { id })
    mainManager.addSpaceWatcher(id)
    return
  }

  const usernames = (user || '').split(',')
    .concat((configManager.config.users || []).map((v) => v.username))
    .filter((v) => v) as string[]
  if (usernames.length) {
    logger.info('Starting in user mode', { users: usernames })
    await userManager.add(usernames)
    if (Util.getTwitterAuthorization() || Util.getTwitterAuthToken()) {
      mainManager.runUserListWatcher()
    } else {
      usernames.forEach((username) => mainManager.addUserWatcher(username))
    }
  }
})

program.parse()

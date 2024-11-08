#!/usr/bin/env node

import axios from 'axios'
import { Command, program } from 'commander'
import dotenv from 'dotenv'
import 'dotenv/config'
import { ccCommand } from './commands/cc.command'
import { testCommand } from './commands/test.command'
import { logger } from './logger'
import { configManager } from './modules/ConfigManager'
import { mainManager } from './modules/MainManager'
import { SpaceDownloader } from './modules/SpaceDownloader'
import { userManager } from './modules/UserManager'
import { CommandUtil } from './utils/CommandUtil'
import { TwitterUtil } from './utils/TwitterUtil'
import { Util } from './utils/Util'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json')

const checkVersion = async () => {
  const url = 'https://registry.npmjs.org/-/package/twspace-crawler/dist-tags'
  try {
    const { data } = await axios.get(url)
    const latestVersion = data.latest
    if (latestVersion === pkg.version) {
      return
    }
    logger.info(`New version: ${latestVersion}`)
    logger.info(`To update, run: npm i -g ${pkg.name}@latest`)
  } catch (error) {
    // Ignore
  }
}

program
  .version(pkg.version)
  .description('CLI app to monitor & download Twitter Spaces.')
  .option('-d, --debug', 'Show debug logs')
  .option('--env <ENV_PATH>', 'Path to .env file, default to current working folder (See .env.example)')
  .option('--config <CONFIG_PATH>', 'Path to config file (See config.example.json)')
  .option('--user <USER>', 'Monitor & download live Spaces from users, separate by comma (,)')
  .option('--id <SPACE_ID>', 'Monitor & download live Space with its id')
  .option('-surl, --space-url <SPACE_URL>', 'Monitor & download live Space with its URL')
  .option('--force', 'Force download Space when using with --id')
  .option('--url <PLAYLIST_ID>', 'Download Space using playlist url')
  .option('--skip-download', 'Do not download anything')
  .option('--skip-download-audio', 'Do not download audio')
  .option('--skip-download-caption', 'Do not download caption')
  .option('--notification', 'Show notification about new live Space')
  .option('--force-open', 'Force open Space in browser')
  .addCommand(ccCommand)
  .addCommand(testCommand)

program.action(async (args, cmd: Command) => {
  logger.info(Array(80).fill('=').join(''))
  logger.info(`Version: ${pkg.version}`)
  CommandUtil.detectDebugOption(cmd)

  await checkVersion()

  logger.debug('Args', args)

  if (args.env) {
    dotenv.config({ path: args.env })
  }

  const envKeys = ['TWITTER_AUTHORIZATION', 'TWITTER_AUTH_TOKEN']
  envKeys.forEach((key) => {
    const limit = 16
    let value = (process.env[key] || '').substring(0, limit)
    if (value) { value += '****' }
    logger.debug(`env.${key}=${value}`)
  })

  // config
  configManager.load()
  configManager.update({
    skipDownload: args.skipDownload ?? configManager.config.skipDownload,
    skipDownloadAudio: args.skipDownloadAudio ?? configManager.config.skipDownloadAudio,
    skipDownloadCaption: args.skipDownloadCaption ?? configManager.config.skipDownloadCaption,
  })

  const {
    url, id, spaceUrl, user,
  } = args

  if (url && !id && !spaceUrl) {
    logger.info('Starting in playlist url mode', { url })
    new SpaceDownloader(url, Util.getDateTimeString()).download()
    return
  }

  if (id) {
    logger.info('Starting in space id mode', { id })
    mainManager.addSpaceWatcher(id)
    return
  }

  if (spaceUrl) {
    logger.info('Starting in space url mode', { spaceUrl })
    const spaceId = TwitterUtil.getSpaceId(spaceUrl)
    if (!spaceId) {
      logger.error(`Space URL invalid: ${spaceUrl}`)
      return
    }
    mainManager.addSpaceWatcher(spaceId)
    return
  }

  const usernames = [...new Set(
    (user || '')
      .split(',')
      .concat((configManager.config.users || []).map((v) => (typeof v === 'string' ? v : v?.username)))
      .filter((v) => v),
  )] as string[]
  if (usernames.length) {
    logger.info('Starting in user mode', { userCount: usernames.length, users: usernames })
    await userManager.add(usernames)
    if (Util.getTwitterAuthorization() || Util.getTwitterAuthToken()) {
      mainManager.runUserListWatcher()
    } else {
      usernames.forEach((username) => mainManager.addUserWatcher(username))
    }
  }
})

program.parse()

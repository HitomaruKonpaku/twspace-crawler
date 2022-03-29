import { program } from 'commander'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'
import winston from 'winston'
import { TwitterApi } from '../apis/TwitterApi'
import { TWITTER_GUEST_TOKEN_DURATION } from '../constants/twitter.constant'
import { Config } from '../interfaces/App.interface'
import { twitterGuestTokenLimiter } from '../Limiter'
import { logger as baseLogger } from '../logger'

class ConfigManager {
  public config: Config
  public guestToken: string
  public guestTokenTime: number

  private logger: winston.Logger

  constructor() {
    this.logger = baseLogger.child({ label: '[ConfigManager]' })
    this.config = {}
  }

  public load() {
    const configPath = program.getOptionValue('config') as string
    if (!configPath) {
      return this.config
    }
    try {
      const payload = readFileSync(configPath, 'utf-8')
      if (configPath.endsWith('yaml')) {
        this.config = yaml.load(payload)
      } else {
        this.config = JSON.parse(payload)
      }
    } catch (error) {
      this.logger.warn(`load: ${error.message}`)
    }
    return this.config
  }

  public async getGuestToken(forceRefresh = false) {
    const token = await twitterGuestTokenLimiter.schedule(async () => {
      const tokenDeltaTime = Date.now() - (this.guestTokenTime || 0)
      if (forceRefresh || !(this.guestToken && tokenDeltaTime < TWITTER_GUEST_TOKEN_DURATION)) {
        this.logger.debug('--> getGuestToken')
        this.guestToken = await TwitterApi.getGuestToken()
        this.guestTokenTime = Date.now()
        this.logger.debug('<-- getGuestToken', { guestToken: this.guestToken })
      }
      return Promise.resolve(this.guestToken)
    })
    return token
  }
}

export const configManager = new ConfigManager()

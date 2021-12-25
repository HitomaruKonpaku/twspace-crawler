import { program } from 'commander'
import { readFileSync } from 'fs'
import winston from 'winston'
import { TwitterApi } from './apis/TwitterApi'
import { TWITTER_GUEST_TOKEN_DURATION } from './constants/twitter.constant'
import { Config } from './interfaces/App.interface'
import { guestTokenRequestLimiter } from './Limiter'
import { logger as baseLogger } from './logger'

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
    const configPath = program.getOptionValue('config')
    if (configPath) {
      try {
        Object.assign(this.config, JSON.parse(readFileSync(configPath, 'utf-8')))
      } catch (error) {
        this.logger.warn(`load: ${error.message}`)
      }
    }
    return this.config
  }

  public async getGuestToken() {
    const guestTokenTimeDelta = Date.now() - (this.guestTokenTime || 0)
    if (!(this.guestToken && guestTokenTimeDelta <= TWITTER_GUEST_TOKEN_DURATION)) {
      try {
        this.logger.debug('>>> getGuestToken')
        this.guestToken = await guestTokenRequestLimiter.schedule(() => TwitterApi.getGuestToken())
        this.guestTokenTime = Date.now()
        this.logger.debug('<<< getGuestToken')
      } catch (error) {
        if (!this.guestToken) {
          throw error
        }
      }
    }
    return this.guestToken
  }
}

export const configManager = new ConfigManager()

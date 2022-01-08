import { program } from 'commander'
import { readFileSync } from 'fs'
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
    const token = await twitterGuestTokenLimiter.schedule(async () => {
      const tokenDeltaTime = Date.now() - (this.guestTokenTime || 0)
      if (!(this.guestToken && tokenDeltaTime < TWITTER_GUEST_TOKEN_DURATION)) {
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

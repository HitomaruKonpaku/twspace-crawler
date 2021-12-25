import { program } from 'commander'
import { readFileSync } from 'fs'
import winston from 'winston'
import { Config } from './interfaces/App.interface'
import { logger as baseLogger } from './logger'

class ConfigManager {
  public config: Config

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
}

export const configManager = new ConfigManager()

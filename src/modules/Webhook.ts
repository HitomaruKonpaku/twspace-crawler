import axios from 'axios'
import { randomUUID } from 'crypto'
import winston from 'winston'
import { logger as baseLogger } from '../logger'
import { TwitterUtil } from '../utils/TwitterUtil'
import { configManager } from './ConfigManager'

export class Webhook {
  private logger: winston.Logger

  constructor(
    private readonly username: string,
    private readonly spaceId: string,
  ) {
    this.logger = baseLogger.child({ label: `[Webhook] [${username}] [${spaceId}]` })
  }

  // eslint-disable-next-line class-methods-use-this
  private get config() {
    return configManager.config?.webhooks
  }

  public send() {
    this.sendDiscord()
  }

  private async post(url: string, body: any) {
    const requestId = randomUUID()
    try {
      this.logger.debug('--> post', {
        requestId,
        url: url.replace(/.{60}$/, '****'),
        body,
      })
      const { data } = await axios.post(url, body)
      this.logger.debug('<-- post', { requestId })
      return data
    } catch (error) {
      this.logger.error(`post: ${error.message}`, { requestId })
    }
    return null
  }

  private sendDiscord() {
    this.logger.debug('sendDiscord')
    const configs = Array.from(this.config?.discord || [])
    configs.forEach((config) => {
      const urls = Array.from(config.urls || [])
        .filter((v) => v)
      const usernames = Array.from(config.usernames || [])
        .filter((v) => v)
        .map((v) => v.toLowerCase())
      if (!urls.length || !usernames.length) {
        return
      }
      if (!usernames.find((v) => v === '<all>') && !usernames.some((v) => v === this.username.toLowerCase())) {
        return
      }
      try {
        // Build content with mentions
        let content = ''
        Array.from(config.mentions?.roleIds || []).forEach((id) => {
          content += `<@&${id}> `
        })
        Array.from(config.mentions?.userIds || []).forEach((id) => {
          content += `<@${id}> `
        })
        content = content.trim()
        // Build request payload
        const payload = {
          content,
          embeds: [
            {
              type: 'rich',
              title: `[${this.username}] Space started!`,
              url: TwitterUtil.getSpaceUrl(this.spaceId),
              color: 0x1d9bf0,
            },
          ],
        }
        // Send
        urls.forEach((url) => this.post(url, payload))
      } catch (error) {
        this.logger.error(`sendDiscord: ${error.message}`)
      }
    })
  }
}

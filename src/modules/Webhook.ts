import { codeBlock, time } from '@discordjs/builders'
import axios from 'axios'
import { randomUUID } from 'crypto'
import winston from 'winston'
import { discordWebhookLimiter } from '../Limiter'
import { logger as baseLogger } from '../logger'
import { TwitterUtil } from '../utils/TwitterUtil'
import { configManager } from './ConfigManager'

interface WebhookMeta {
  author?: {
    name?: string
    url?: string
    iconUrl?: string
  }
  space?: {
    title?: string
    startedAt?: number
    masterUrl?: string
  }
}

export class Webhook {
  private logger: winston.Logger

  constructor(
    private readonly username: string,
    private readonly spaceId: string,
    private readonly meta?: WebhookMeta,
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
      if (!config.active) {
        return
      }
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
              title: `${this.meta?.author?.name || this.username} is hosting a Space`,
              description: TwitterUtil.getSpaceUrl(this.spaceId),
              color: 0x1d9bf0,
              author: {
                name: `${this.meta?.author?.name} (@${this.username})`.trim(),
                url: this.meta?.author?.url,
                icon_url: this.meta?.author?.iconUrl,
              },
              fields: [
                {
                  name: 'Title',
                  value: codeBlock(this.meta?.space?.title),
                },
                {
                  name: 'Started At',
                  value: codeBlock(String(this.meta?.space?.startedAt)),
                  inline: true,
                },
                {
                  name: 'Started At - Local',
                  value: this.meta?.space?.startedAt
                    ? time(Math.floor(this.meta.space.startedAt / 1000))
                    : null,
                  inline: true,
                },
                {
                  name: 'Master Url',
                  value: codeBlock(this.meta?.space?.masterUrl),
                },
              ],
              footer: {
                text: 'Twitter',
                icon_url: 'https://abs.twimg.com/favicons/twitter.2.ico',
              },
            },
          ],
        }
        // Send
        urls.forEach((url) => discordWebhookLimiter.schedule(() => this.post(url, payload)))
      } catch (error) {
        this.logger.error(`sendDiscord: ${error.message}`)
      }
    })
  }
}

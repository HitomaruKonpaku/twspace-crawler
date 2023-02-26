import { codeBlock, inlineCode, time } from '@discordjs/builders'
import axios from 'axios'
import { randomUUID } from 'crypto'
import winston from 'winston'
import { AudioSpaceMetadataState } from '../enums/Twitter.enum'
import { AudioSpace } from '../interfaces/Twitter.interface'
import { discordWebhookLimiter } from '../Limiter'
import { logger as baseLogger } from '../logger'
import { SpaceUtil } from '../utils/SpaceUtil'
import { TwitterUtil } from '../utils/TwitterUtil'
import { configManager } from './ConfigManager'

export class Webhook {
  private logger: winston.Logger

  constructor(
    private readonly audioSpace: AudioSpace,
    private readonly masterUrl: string,
  ) {
    const username = SpaceUtil.getHostUsername(audioSpace)
    const spaceId = SpaceUtil.getId(audioSpace)
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
      if (!usernames.find((v) => v === '<all>') && usernames.every((v) => !SpaceUtil.isParticipant(this.audioSpace, v))) {
        return
      }
      try {
        // Build content with mentions
        let content = ''
        if (this.audioSpace.metadata.state === AudioSpaceMetadataState.RUNNING) {
          Array.from(config.mentions?.roleIds || []).map((v) => v).forEach((roleId) => {
            content += `<@&${roleId}> `
          })
          Array.from(config.mentions?.userIds || []).map((v) => v).forEach((userId) => {
            content += `<@${userId}> `
          })
          content = [content, config.startMessage].filter((v) => v).map((v) => v.trim()).join(' ')
        }
        if (this.audioSpace.metadata.state === AudioSpaceMetadataState.ENDED) {
          content = [content, config.endMessage].filter((v) => v).map((v) => v.trim()).join(' ')
        }
        content = content.trim()
        // Build request payload
        const payload = {
          content,
          embeds: [this.getEmbed(usernames)],
        }
        // Send
        urls.forEach((url) => discordWebhookLimiter.schedule(() => this.post(url, payload)))
      } catch (error) {
        this.logger.error(`sendDiscord: ${error.message}`)
      }
    })
  }

  private getEmbedTitle(usernames: string[]): string {
    const hostUsername = SpaceUtil.getHostUsername(this.audioSpace)
    const host = inlineCode(hostUsername)

    if (this.audioSpace.metadata.state === AudioSpaceMetadataState.ENDED) {
      return `${host} Space ended`
    }

    if (!usernames.some((v) => v.toLowerCase() === hostUsername.toLowerCase())
      && usernames.some((v) => SpaceUtil.isAdmin(this.audioSpace, v))) {
      const participants = usernames
        .map((v) => SpaceUtil.getParticipant(this.audioSpace.participants.admins, v))
        .filter((v) => v)
      if (participants.length) {
        const guests = participants
          .map((v) => inlineCode(v.twitter_screen_name))
          .join(', ')
        return `${guests} is co-hosting ${host}'s Space`
      }
    }

    if (usernames.some((v) => SpaceUtil.isSpeaker(this.audioSpace, v))) {
      const participants = usernames
        .map((v) => SpaceUtil.getParticipant(this.audioSpace.participants.speakers, v))
        .filter((v) => v)
      if (participants.length) {
        const guests = participants
          .map((v) => inlineCode(v.twitter_screen_name))
          .join(', ')
        return `${guests} is speaking in ${host}'s Space`
      }
    }

    if (usernames.some((v) => SpaceUtil.isListener(this.audioSpace, v))) {
      const participants = usernames
        .map((v) => SpaceUtil.getParticipant(this.audioSpace.participants.listeners, v))
        .filter((v) => v)
      if (participants.length) {
        const guests = participants
          .map((v) => inlineCode(v.twitter_screen_name))
          .join(', ')
        return `${guests} is listening in ${host}'s Space`
      }
    }

    return `${host} is hosting a Space`
  }

  private getEmbed(usernames: string[]) {
    const username = SpaceUtil.getHostUsername(this.audioSpace)
    const name = SpaceUtil.getHostName(this.audioSpace)
    const fields: any[] = [
      {
        name: '📄 Title',
        value: codeBlock(SpaceUtil.getTitle(this.audioSpace)),
      },
    ]

    if ([AudioSpaceMetadataState.RUNNING, AudioSpaceMetadataState.ENDED].includes(this.audioSpace.metadata.state as any)) {
      if (this.audioSpace.metadata.started_at) {
        fields.push(
          {
            name: '▶️ Started at',
            value: Webhook.getEmbedLocalTime(this.audioSpace.metadata.started_at),
            inline: true,
          },
        )
      }
    }

    if ([AudioSpaceMetadataState.ENDED].includes(this.audioSpace.metadata.state as any)) {
      if (this.audioSpace.metadata.ended_at) {
        fields.push(
          {
            name: '⏹️ Ended at',
            value: Webhook.getEmbedLocalTime(Number(this.audioSpace.metadata.ended_at)),
            inline: true,
          },
        )
      }
    }

    if ([AudioSpaceMetadataState.RUNNING, AudioSpaceMetadataState.ENDED].includes(this.audioSpace.metadata.state as any)) {
      fields.push(
        {
          name: '🔗 Playlist url',
          value: codeBlock(this.masterUrl),
        },
      )
    }

    const embed = {
      type: 'rich',
      title: this.getEmbedTitle(usernames),
      description: TwitterUtil.getSpaceUrl(SpaceUtil.getId(this.audioSpace)),
      color: 0x1d9bf0,
      author: {
        name: `${name} (@${username})`,
        url: TwitterUtil.getUserUrl(username),
        icon_url: SpaceUtil.getHostProfileImgUrl(this.audioSpace),
      },
      fields,
      footer: {
        text: 'Twitter',
        icon_url: 'https://abs.twimg.com/favicons/twitter.2.ico',
      },
    }

    return embed
  }

  public static getEmbedLocalTime(ms: number) {
    if (!ms) {
      return null
    }
    return [
      time(Math.floor(ms / 1000)),
      time(Math.floor(ms / 1000), 'R'),
    ].join('\n')
  }
}

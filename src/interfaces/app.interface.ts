import { UserConfig } from './user.interface'

export interface WebhookConfig {
  active?: boolean

  urls?: string[]
  mentions?: {
    userIds?: string
    roleIds?: string
  }

  startMessage?: string
  endMessage?: string

  usernames?: ('<all>' | string)[]
}

export interface Config {
  interval?: number

  skipDownload?: boolean
  skipDownloadAudio?: boolean
  skipDownloadCaption?: boolean

  ffmpegArgs?: string[]

  ffmpeg?: {
    audio?: {
      extension?: string
      args?: string[]
    }
    video?: {
      extension?: string
      args?: string[]
    }
  }

  downloadDir?: string

  users?: (string | number | UserConfig)[]

  webhooks?: {
    discord?: WebhookConfig[]
  }
}

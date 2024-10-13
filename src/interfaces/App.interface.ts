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

  ffmpegArgs?: string[]

  users?: (string | {
    username: string
    [key: string]: any
  })[]

  webhooks?: {
    discord?: WebhookConfig[]
  }
}

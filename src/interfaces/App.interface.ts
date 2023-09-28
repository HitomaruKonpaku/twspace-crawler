export interface Config {
  interval?: number

  ffmpegArgs?: string[]

  users?: (string | {
    username: string
    [key: string]: any
  })[]

  webhooks?: {
    discord?: {
      active: boolean
      urls: string[]
      usernames: ('<all>' | string)[]
      mentions?: {
        roleIds?: string[]
        userIds?: string[]
      }
      startMessage?: string
      endMessage?: string
    }[]
  }
}

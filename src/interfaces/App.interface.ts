export interface Config {
  users?: {
    username: string
    [key: string]: any
  }[]

  interval?: number

  webhooks?: {
    discord?: {
      urls: string[]
      usernames: ('<all>' | string)[]
      mentions?: {
        roleIds?: string[]
        userIds?: string[]
      }
    }[]
  }
}

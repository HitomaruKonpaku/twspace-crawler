export interface Config {
  interval?: number

  users?: {
    username: string
    [key: string]: any
  }[]

  webhooks?: {
    discord?: {
      active: boolean
      urls: string[]
      usernames: ('<all>' | string)[]
      mentions?: {
        roleIds?: string[]
        userIds?: string[]
      }
    }[]
  }
}

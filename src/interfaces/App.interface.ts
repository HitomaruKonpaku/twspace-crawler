export interface Config {
  interval?: number

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
    }[]
  }
}

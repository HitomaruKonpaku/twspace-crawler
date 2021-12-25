export interface Config {
  users?: {
    username: string
    [key: string]: any
  }[]

  interval?: number

  [key: string]: any
}

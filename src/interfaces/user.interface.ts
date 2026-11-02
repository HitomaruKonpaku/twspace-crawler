export interface UserConfig {
  id?: string | number
  username?: string
  dir?: string
}

export type UserInput = string | number | UserConfig

export interface User {
  id: string
  username: string
  dir?: string
}

import { SpaceState } from '../enums/Twitter.enum'

export interface BaseResponse<T> {
  data: T
}

export interface User {
  id: string
  name: string
  username: string
}

export interface Space {
  id: string
  state: SpaceState
}

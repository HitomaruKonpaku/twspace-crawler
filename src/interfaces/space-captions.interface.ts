import { AudioSpace } from '../api/interface/twitter-graphql.interface'
import { User } from './user.interface'

export interface SpaceCaptionsChat {
  ts: string
  chatType: number
  userId: string
  legacyUuid?: string
  message?: string
  final?: boolean
  controlType?: number
  targetUserId?: string
  targetSessionUuid?: string
}

export interface SpaceCaptionsDownloaderOptions {
  spaceId: string
  audioSpace?: AudioSpace
  file?: string
}

export interface SpaceCaptionsDownloaderResult {
  spaceId: string
  chatCount: number
  chats: SpaceCaptionsChat[]
  metadata: {
    audioSpace?: AudioSpace
    extraUsers?: User[]
  }
}

export interface SpaceCaptionsExtractorOptions {
  inpFile: string
  outFile?: string
}

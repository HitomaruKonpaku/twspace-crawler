import { SpaceState } from '../enums/Twitter.enum'
import { TwitterUser } from './twitter-user'

export class TwitterSpace {
  id: string
  createdAt?: number
  updatedAt?: number

  creatorId: string
  state: SpaceState
  isTicketed?: boolean
  scheduledStart?: number
  startedAt?: number
  endedAt?: number
  lang?: string
  title?: string

  hostIds?: string[]
  speakerIds?: string[]
  listenerIds?: string[]

  participantCount?: number
  totalLiveListeners?: number
  totalReplayWatched?: number

  isAvailableForReplay?: boolean
  isAvailableForClipping?: boolean

  narrowCastSpaceType?: number

  playlistUrl?: string
  playlistActive?: boolean

  creator?: TwitterUser
  hosts?: TwitterUser[]
  speakers?: TwitterUser[]
  listeners?: TwitterUser[]
}

import { MessageKind } from '../enums/Periscope.enum'

/* eslint-disable camelcase */
export interface AccessChat {
  subscriber: string
  publisher: string
  auth_token: string
  signer_key: string
  signer_token: string
  channel: string
  should_verify_signature: boolean
  access_token: string
  endpoint: string
  replay_access_token: string
  replay_endpoint: string
  room_id: string
  participant_index: number
  read_only: boolean
  should_log: boolean
  chan_perms: {
    pb: number
    cm: number
  }
}

export interface ChatMessageData {
  body: string
  displayName: string
  final: boolean
  ntpForBroadcasterFrame: number
  ntpForLiveFrame: number
  participant_index: number
  programDateTime: string
  remoteID: string
  timestamp: number
  twitter_id: string
  type: number
  user_id: string
  username: string
  uuid: string
  v: number
}

export interface ChatMessageSender {
  user_id: string
  username: string
  display_name: string
  profile_image_url: string
  participant_index: number
  twitter_id: string
}

export interface ChatMessage {
  room: string
  body: string
  lang: string
  sender: ChatMessageSender
  timestamp: number
  uuid: string
}

export interface ChatHistoryMessage {
  kind: MessageKind | number
  payload: string
  signature: string
}

export interface ChatHistory {
  messages: ChatHistoryMessage[]
  cursor: string
}

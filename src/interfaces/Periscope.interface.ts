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

export interface ChatMessage {
  kind: MessageKind | number
  payload: string
  signature: string
}

export interface ChatHistory {
  messages: ChatMessage[]
  cursor: string
}

/* eslint-disable camelcase */

import { AudioSpaceMetadataState } from '../enum/twitter-graphql.enum'

export interface AudioSpaceMetadata {
  rest_id?: string
  broadcast_id?: string

  state: AudioSpaceMetadataState
  title?: string
  language?: string

  media_key?: string

  created_at?: number
  updated_at?: number
  scheduled_start?: number
  started_at?: number
  start?: number
  ended_at?: number | string

  narrow_cast_space_type?: number
  conversation_controls?: number

  disallow_join?: boolean
  is_employee_only?: boolean
  is_muted?: boolean
  is_locked?: boolean
  is_space_available_for_replay?: boolean
  is_space_available_for_clipping?: boolean
  is_trending?: boolean
  enable_server_audio_transcription?: boolean

  total_participated?: number
  total_participating?: number
  total_live_listeners?: number
  total_replay_watched?: number

  tickets_sold?: number
  tickets_total?: number

  creator_results: {
    result: {
      id: string
      rest_id: string
      is_blue_verified?: boolean
      legacy: {
        created_at: string
        default_profile: boolean
        default_profile_image: boolean
        description: string
        fast_followers_count: number
        favourites_count: number
        followers_count: number
        friends_count: number
        has_custom_timelines: boolean
        is_translator: boolean
        listed_count: number
        location: string
        media_count: number
        name: string
        normal_followers_count: number
        profile_banner_url: string
        profile_image_url_https: string
        profile_interstitial_type: string
        protected: boolean
        screen_name: string
        statuses_count: number
        translator_type?: string
        url?: string
        verified: boolean
        [key: string]: any
      }
      [key: string]: any
    }
    [key: string]: any
  }

  [key: string]: any
}

export interface AudioSpaceParticipantUser {
  rest_id: string
}

export interface AudioSpaceParticipantUserResults extends AudioSpaceParticipantUser {
  result: {
    rest_id?: string
    has_nft_avatar?: boolean
    is_blue_verified?: boolean
    legacy?: any
  }
}

export interface AudioSpaceParticipant {
  periscope_user_id: string
  start: number
  twitter_screen_name: string
  display_name: string
  avatar_url: string
  is_verified: boolean
  is_muted_by_admin: boolean
  is_muted_by_guest: boolean
  user_results: AudioSpaceParticipantUserResults
  user?: AudioSpaceParticipantUser
  [key: string]: any
}

export interface AudioSpaceParticipants {
  total: number
  admins: AudioSpaceParticipant[]
  speakers: AudioSpaceParticipant[]
  listeners: AudioSpaceParticipant[]
}

export interface AudioSpace {
  rest_id?: string
  metadata: AudioSpaceMetadata
  participants?: AudioSpaceParticipants
  is_subscribed?: boolean
  subscriber_count?: number
  sharings?: any
}

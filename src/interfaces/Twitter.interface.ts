/* eslint-disable camelcase */
export interface User {
  id: number
  id_str: string
  name: string
  screen_name: string
  protected: boolean
  verified: boolean
  created_at: string
  profile_banner_url: string
  profile_image_url_https: string
}

export interface AudioSpaceMetadata {
  rest_id: string
  state: string
  title: string
  media_key: string
  created_at: number
  updated_at: number
  started_at?: number
  ended_at?: number
  is_employee_only: boolean
  is_locked: boolean
  conversation_controls: number
  creator_results: {
    result: {
      id: string
      rest_id: string
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
  [key: string]: any
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
  user: AudioSpaceParticipantUser
  [key: string]: any
}

export interface AudioSpaceParticipants {
  total: number
  admins: AudioSpaceParticipant[]
  speakers: AudioSpaceParticipant[]
  listeners: AudioSpaceParticipant[]
}

export interface AudioSpace {
  metadata: AudioSpaceMetadata
  participants: AudioSpaceParticipants
  sharings?: any
}

export interface LiveVideoStreamStatus {
  source: {
    location: string
    noRedirectPlaybackUrl: string
    status: string
    streamType: string
  }
  sessionId: string
  chatToken: string
  lifecycleToken: string
  shareUrl: string
  chatPermissionType: string
}

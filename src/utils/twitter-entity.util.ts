import { AudioSpace, AudioSpaceParticipant } from '../api/interface/twitter-graphql.interface'
import { TwitterSpace } from '../model/twitter-space'
import { TwitterUser } from '../model/twitter-user'
import { TwitterSpaceUtil } from './twitter-space.util'

export class TwitterEntityUtil {
  public static buildUserByParticipant(participant: AudioSpaceParticipant): TwitterUser {
    const { result } = participant.user_results as any
    const obj: TwitterUser = {
      id: result.rest_id,
      username: result.legacy.screen_name,
      name: result.legacy.name,
    }
    return obj
  }

  public static buildSpaceByAudioSpace(audioSpace: AudioSpace): TwitterSpace {
    const { metadata, participants } = audioSpace
    const creator = participants.admins[0]
    const obj: TwitterSpace = {
      id: audioSpace.rest_id || metadata.rest_id,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      creatorId: creator.user_results.result.rest_id || creator.user_results.rest_id,
      state: TwitterSpaceUtil.parseState(metadata.state),
      scheduledStart: metadata.scheduled_start,
      startedAt: metadata.start || metadata.started_at,
      endedAt: Number(metadata.ended_at) || undefined,
      lang: metadata.language,
      title: metadata.title,
      hostIds: participants.admins.map((v) => v.user_results.result.rest_id || v.user_results.rest_id),
      speakerIds: participants.speakers.map((v) => v.user_results.result.rest_id || v.user_results.rest_id),
      participantCount: metadata.total_participated,
      totalLiveListeners: metadata.total_live_listeners,
      totalReplayWatched: metadata.total_replay_watched,
      isAvailableForReplay: metadata.is_space_available_for_replay,
      isAvailableForClipping: metadata.is_space_available_for_clipping,
      narrowCastSpaceType: metadata.narrow_cast_space_type,
      // subscriberCount: audioSpace.subscriber_count,
      // ticketsSold: metadata.tickets_sold,
      // ticketsTotal: metadata.tickets_total,
    }
    obj.creator = TwitterEntityUtil.buildUserByParticipant(participants.admins[0])
    obj.hosts = participants.admins.map((v) => TwitterEntityUtil.buildUserByParticipant(v))
    obj.speakers = participants.speakers.map((v) => TwitterEntityUtil.buildUserByParticipant(v))
    return obj
  }
}

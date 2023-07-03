import { AudioSpace, AudioSpaceParticipant } from '../interfaces/Twitter.interface'
import { TwitterSpace } from '../model/twitter-space'
import { TwitterUser } from '../model/twitter-user'
import { TwitterSpaceUtil } from './twitter-space.util'

export class TwitterEntityUtil {
  public static buildUserByParticipant(participant: AudioSpaceParticipant): TwitterUser {
    const obj: TwitterUser = {
      id: participant.user_results.rest_id,
      username: participant.twitter_screen_name,
      name: participant.display_name,
    }
    return obj
  }

  public static buildSpaceByAudioSpace(audioSpace: AudioSpace): TwitterSpace {
    const { metadata, participants } = audioSpace
    const creator = participants.admins[0]
    const obj: TwitterSpace = {
      id: metadata.rest_id,
      createdAt: metadata.created_at,
      updatedAt: metadata.updated_at,
      creatorId: creator.user_results.rest_id,
      state: TwitterSpaceUtil.parseState(metadata.state),
      scheduledStart: metadata.scheduled_start,
      startedAt: metadata.started_at,
      endedAt: Number(metadata.ended_at) || undefined,
      title: metadata.title,
      hostIds: participants.admins.map((v) => v.user_results.rest_id),
      speakerIds: participants.speakers.map((v) => v.user_results.rest_id),
      totalLiveListeners: metadata.total_live_listeners,
      totalReplayWatched: metadata.total_replay_watched,
      isAvailableForReplay: metadata.is_space_available_for_replay,
      isAvailableForClipping: metadata.is_space_available_for_clipping,
    }
    obj.creator = TwitterEntityUtil.buildUserByParticipant(participants.admins[0])
    obj.hosts = participants.admins.map((v) => TwitterEntityUtil.buildUserByParticipant(v))
    obj.speakers = participants.speakers.map((v) => TwitterEntityUtil.buildUserByParticipant(v))
    return obj
  }
}

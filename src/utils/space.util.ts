/* eslint-disable max-len */

import { AudioSpace, AudioSpaceParticipant } from '../api/interface/twitter-graphql.interface'

export class SpaceUtil {
  public static getId(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.rest_id
  }

  public static getCreatedAt(audioSpace: AudioSpace): number {
    return audioSpace?.metadata?.created_at
  }

  public static getStartedAt(audioSpace: AudioSpace): number {
    return audioSpace?.metadata?.started_at
  }

  public static getTitle(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.title
  }

  public static getHostUsername(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.creator_results?.result?.legacy?.screen_name
  }

  public static getHostName(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.creator_results?.result?.legacy?.name
  }

  public static getHostProfileImgUrl(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.creator_results?.result?.legacy?.profile_image_url_https?.replace?.('_normal', '')
  }

  public static getHostProfileBannerUrl(audioSpace: AudioSpace): string {
    return audioSpace?.metadata?.creator_results?.result?.legacy?.profile_banner_url
  }

  public static getParticipant(participants: AudioSpaceParticipant[], username: string): AudioSpaceParticipant {
    const result = participants?.find?.((v) => v?.user_results?.result?.legacy?.screen_name?.toLowerCase?.() === username?.toLowerCase?.())
      || participants?.find?.((v) => v?.twitter_screen_name?.toLowerCase?.() === username?.toLowerCase?.())
    return result
  }

  public static isUserInParticipants(participants: AudioSpaceParticipant[], username: string): boolean {
    return !!SpaceUtil.getParticipant(participants, username)
  }

  public static isAdmin(audioSpace: AudioSpace, username: string): boolean {
    return SpaceUtil.isUserInParticipants(audioSpace?.participants?.admins, username)
  }

  public static isSpeaker(audioSpace: AudioSpace, username: string): boolean {
    return SpaceUtil.isUserInParticipants(audioSpace?.participants?.speakers, username)
  }

  public static isListener(audioSpace: AudioSpace, username: string): boolean {
    return SpaceUtil.isUserInParticipants(audioSpace?.participants?.listeners, username)
  }

  public static isParticipant(audioSpace: AudioSpace, username: string): boolean {
    return this.isAdmin(audioSpace, username) || this.isSpeaker(audioSpace, username) || this.isListener(audioSpace, username)
  }
}

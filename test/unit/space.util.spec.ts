import fs from 'fs'
import path from 'path'
import { SpaceUtil } from '../../src/utils/space.util'

const fixtureFile = path.join(__dirname, '../data/e2e/1YqJDoNBbOaGV.json')
const fixture = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'))

const byIdSpace = fixture.graphql.AudioSpaceById.body.data.audioSpace
const byRestIdSpace = fixture.graphql.AudiospaceByRestId.body.data.audio_space_by_rest_id

const hostUsername = 'ninomaeinanis'
const hostName = "Ninomae Ina'nis🐙"
const hostProfileImgUrl = 'https://pbs.twimg.com/profile_images/2035735993689714688/prsJENJA_normal.png'
const hostProfileBannerUrl = 'https://pbs.twimg.com/profile_banners/1283650008835743744/1763997037'

const spaceWithSpeakers = {
  ...byIdSpace,
  participants: {
    ...byIdSpace.participants,
    speakers: byIdSpace.participants.admins,
  },
}

const spaceWithListeners = {
  ...byIdSpace,
  participants: {
    ...byIdSpace.participants,
    listeners: byIdSpace.participants.admins,
  },
}

describe('SpaceUtil', () => {
  describe('getId', () => {
    it('returns rest_id from AudioSpaceById metadata', () => {
      expect(SpaceUtil.getId(byIdSpace)).toEqual('1YqJDoNBbOaGV')
    })

    it('returns undefined when metadata has no rest_id', () => {
      expect(SpaceUtil.getId(byRestIdSpace)).toBeUndefined()
    })
  })

  describe('getCreatedAt', () => {
    it('returns created_at from AudioSpaceById', () => {
      expect(SpaceUtil.getCreatedAt(byIdSpace)).toEqual(1694379636793)
    })

    it('returns created_at from AudiospaceByRestId', () => {
      expect(SpaceUtil.getCreatedAt(byRestIdSpace)).toEqual(1694379636793)
    })
  })

  describe('getStartedAt', () => {
    it('returns started_at from AudioSpaceById', () => {
      expect(SpaceUtil.getStartedAt(byIdSpace)).toEqual(1694379642518)
    })

    it('returns undefined when started_at is missing', () => {
      expect(SpaceUtil.getStartedAt(byRestIdSpace)).toBeUndefined()
    })
  })

  describe('getTitle', () => {
    it('returns the title', () => {
      expect(SpaceUtil.getTitle(byIdSpace)).toEqual('Sufficiently Preserved #InaInaSpace')
      expect(SpaceUtil.getTitle(byRestIdSpace)).toEqual('Sufficiently Preserved #InaInaSpace')
    })
  })

  describe('getHostUsername', () => {
    it('returns the host username', () => {
      expect(SpaceUtil.getHostUsername(byIdSpace)).toEqual(hostUsername)
      expect(SpaceUtil.getHostUsername(byRestIdSpace)).toEqual(hostUsername)
    })
  })

  describe('getHostName', () => {
    it('returns the host name', () => {
      expect(SpaceUtil.getHostName(byIdSpace)).toEqual(hostName)
      expect(SpaceUtil.getHostName(byRestIdSpace)).toEqual(hostName)
    })
  })

  describe('getHostProfileImgUrl', () => {
    it('strips the _normal suffix from the profile image URL', () => {
      expect(SpaceUtil.getHostProfileImgUrl(byIdSpace)).toEqual(hostProfileImgUrl.replace('_normal', ''))
      expect(SpaceUtil.getHostProfileImgUrl(byRestIdSpace)).toEqual(hostProfileImgUrl.replace('_normal', ''))
    })

    it('returns undefined when the profile image URL is missing', () => {
      expect(SpaceUtil.getHostProfileImgUrl({ metadata: { creator_results: { result: { legacy: {} } } } } as any)).toBeUndefined()
    })
  })

  describe('getHostProfileBannerUrl', () => {
    it('returns the profile banner URL', () => {
      expect(SpaceUtil.getHostProfileBannerUrl(byIdSpace)).toEqual(hostProfileBannerUrl)
      expect(SpaceUtil.getHostProfileBannerUrl(byRestIdSpace)).toEqual(hostProfileBannerUrl)
    })
  })

  describe('getParticipant', () => {
    it('matches the participant by legacy screen_name', () => {
      const participant = SpaceUtil.getParticipant(byRestIdSpace.participants.admins, hostUsername)
      expect(participant).toBeDefined()
      expect(participant.user_results.result.legacy.screen_name).toEqual(hostUsername)
    })

    it('matches the participant by twitter_screen_name when legacy is empty', () => {
      const participant = SpaceUtil.getParticipant(byIdSpace.participants.admins, hostUsername)
      expect(participant).toBeDefined()
      expect(participant.twitter_screen_name).toEqual(hostUsername)
    })

    it('ignores case', () => {
      expect(SpaceUtil.getParticipant(byIdSpace.participants.admins, 'NINOMAEINANIS')).toBeDefined()
    })

    it('returns undefined when the user is not in the list', () => {
      expect(SpaceUtil.getParticipant(byIdSpace.participants.admins, 'unknown')).toBeUndefined()
    })

    it('returns undefined when there are no participants', () => {
      expect(SpaceUtil.getParticipant(undefined, hostUsername)).toBeUndefined()
    })
  })

  describe('isUserInParticipants', () => {
    it('returns true when the user is in the list', () => {
      expect(SpaceUtil.isUserInParticipants(byIdSpace.participants.admins, hostUsername)).toBe(true)
    })

    it('returns false when the user is not in the list', () => {
      expect(SpaceUtil.isUserInParticipants(byIdSpace.participants.listeners, hostUsername)).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('returns true for an admin', () => {
      expect(SpaceUtil.isAdmin(byIdSpace, hostUsername)).toBe(true)
      expect(SpaceUtil.isAdmin(byRestIdSpace, hostUsername)).toBe(true)
    })

    it('returns false for an unknown user', () => {
      expect(SpaceUtil.isAdmin(byIdSpace, 'unknown')).toBe(false)
    })
  })

  describe('isSpeaker', () => {
    it('returns true for a speaker', () => {
      expect(SpaceUtil.isSpeaker(spaceWithSpeakers, hostUsername)).toBe(true)
    })

    it('returns false when the user is not a speaker', () => {
      expect(SpaceUtil.isSpeaker(byIdSpace, hostUsername)).toBe(false)
    })
  })

  describe('isListener', () => {
    it('returns true for a listener', () => {
      expect(SpaceUtil.isListener(spaceWithListeners, hostUsername)).toBe(true)
    })

    it('returns false when the user is not a listener', () => {
      expect(SpaceUtil.isListener(byIdSpace, hostUsername)).toBe(false)
    })
  })

  describe('isParticipant', () => {
    it('returns true for an admin', () => {
      expect(SpaceUtil.isParticipant(byIdSpace, hostUsername)).toBe(true)
    })

    it('returns true for a listener', () => {
      expect(SpaceUtil.isParticipant(spaceWithListeners, hostUsername)).toBe(true)
    })

    it('returns false for an unknown user', () => {
      expect(SpaceUtil.isParticipant(byIdSpace, 'unknown')).toBe(false)
    })
  })
})

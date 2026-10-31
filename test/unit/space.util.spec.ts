import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import fs from 'fs'
import path from 'path'
import { SpaceUtil } from '../../src/utils/space.util'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

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
      expect(SpaceUtil.getId(byIdSpace)).equal('1YqJDoNBbOaGV')
    })

    it('returns undefined when metadata has no rest_id', () => {
      expect(SpaceUtil.getId(byRestIdSpace)).undefined()
    })
  })

  describe('getCreatedAt', () => {
    it('returns created_at from AudioSpaceById', () => {
      expect(SpaceUtil.getCreatedAt(byIdSpace)).equal(1694379636793)
    })

    it('returns created_at from AudiospaceByRestId', () => {
      expect(SpaceUtil.getCreatedAt(byRestIdSpace)).equal(1694379636793)
    })
  })

  describe('getStartedAt', () => {
    it('returns started_at from AudioSpaceById', () => {
      expect(SpaceUtil.getStartedAt(byIdSpace)).equal(1694379642518)
    })

    it('returns undefined when started_at is missing', () => {
      expect(SpaceUtil.getStartedAt(byRestIdSpace)).undefined()
    })
  })

  describe('getTitle', () => {
    it('returns the title', () => {
      expect(SpaceUtil.getTitle(byIdSpace)).equal('Sufficiently Preserved #InaInaSpace')
      expect(SpaceUtil.getTitle(byRestIdSpace)).equal('Sufficiently Preserved #InaInaSpace')
    })
  })

  describe('getHostUsername', () => {
    it('returns the host username', () => {
      expect(SpaceUtil.getHostUsername(byIdSpace)).equal(hostUsername)
      expect(SpaceUtil.getHostUsername(byRestIdSpace)).equal(hostUsername)
    })
  })

  describe('getHostName', () => {
    it('returns the host name', () => {
      expect(SpaceUtil.getHostName(byIdSpace)).equal(hostName)
      expect(SpaceUtil.getHostName(byRestIdSpace)).equal(hostName)
    })
  })

  describe('getHostProfileImgUrl', () => {
    it('strips the _normal suffix from the profile image URL', () => {
      expect(SpaceUtil.getHostProfileImgUrl(byIdSpace)).equal(hostProfileImgUrl.replace('_normal', ''))
      expect(SpaceUtil.getHostProfileImgUrl(byRestIdSpace)).equal(hostProfileImgUrl.replace('_normal', ''))
    })

    it('returns undefined when the profile image URL is missing', () => {
      expect(SpaceUtil.getHostProfileImgUrl({ metadata: { creator_results: { result: { legacy: {} } } } })).undefined()
    })
  })

  describe('getHostProfileBannerUrl', () => {
    it('returns the profile banner URL', () => {
      expect(SpaceUtil.getHostProfileBannerUrl(byIdSpace)).equal(hostProfileBannerUrl)
      expect(SpaceUtil.getHostProfileBannerUrl(byRestIdSpace)).equal(hostProfileBannerUrl)
    })
  })

  describe('getParticipant', () => {
    it('matches the participant by legacy screen_name', () => {
      const participant = SpaceUtil.getParticipant(byRestIdSpace.participants.admins, hostUsername)
      expect(participant).exist()
      expect(participant.user_results.result.legacy.screen_name).equal(hostUsername)
    })

    it('matches the participant by twitter_screen_name when legacy is empty', () => {
      const participant = SpaceUtil.getParticipant(byIdSpace.participants.admins, hostUsername)
      expect(participant).exist()
      expect(participant.twitter_screen_name).equal(hostUsername)
    })

    it('ignores case', () => {
      expect(SpaceUtil.getParticipant(byIdSpace.participants.admins, 'NINOMAEINANIS')).exist()
    })

    it('returns undefined when the user is not in the list', () => {
      expect(SpaceUtil.getParticipant(byIdSpace.participants.admins, 'unknown')).undefined()
    })

    it('returns undefined when there are no participants', () => {
      expect(SpaceUtil.getParticipant(undefined, hostUsername)).undefined()
    })
  })

  describe('isUserInParticipants', () => {
    it('returns true when the user is in the list', () => {
      expect(SpaceUtil.isUserInParticipants(byIdSpace.participants.admins, hostUsername)).true()
    })

    it('returns false when the user is not in the list', () => {
      expect(SpaceUtil.isUserInParticipants(byIdSpace.participants.listeners, hostUsername)).false()
    })
  })

  describe('isAdmin', () => {
    it('returns true for an admin', () => {
      expect(SpaceUtil.isAdmin(byIdSpace, hostUsername)).true()
      expect(SpaceUtil.isAdmin(byRestIdSpace, hostUsername)).true()
    })

    it('returns false for an unknown user', () => {
      expect(SpaceUtil.isAdmin(byIdSpace, 'unknown')).false()
    })
  })

  describe('isSpeaker', () => {
    it('returns true for a speaker', () => {
      expect(SpaceUtil.isSpeaker(spaceWithSpeakers, hostUsername)).true()
    })

    it('returns false when the user is not a speaker', () => {
      expect(SpaceUtil.isSpeaker(byIdSpace, hostUsername)).false()
    })
  })

  describe('isListener', () => {
    it('returns true for a listener', () => {
      expect(SpaceUtil.isListener(spaceWithListeners, hostUsername)).true()
    })

    it('returns false when the user is not a listener', () => {
      expect(SpaceUtil.isListener(byIdSpace, hostUsername)).false()
    })
  })

  describe('isParticipant', () => {
    it('returns true for an admin', () => {
      expect(SpaceUtil.isParticipant(byIdSpace, hostUsername)).true()
    })

    it('returns true for a listener', () => {
      expect(SpaceUtil.isParticipant(spaceWithListeners, hostUsername)).true()
    })

    it('returns false for an unknown user', () => {
      expect(SpaceUtil.isParticipant(byIdSpace, 'unknown')).false()
    })
  })
})

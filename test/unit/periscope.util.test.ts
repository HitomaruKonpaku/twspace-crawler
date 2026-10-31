import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { PeriscopeUtil } from '../../src/utils/PeriscopeUtil'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

const base = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const newLiveUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const oldLiveUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const genericArchiveUrl = `${base}/periscope-replays-public/audio-space/master_playlist.m3u8`

describe('PeriscopeUtil', () => {
  describe('getPlaylistUrlCandidates', () => {
    it('returns the live, generic archive, and regional archive URLs for the new live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(newLiveUrl)).equal([
        newLiveUrl,
        genericArchiveUrl,
        oldLiveUrl,
      ])
    })

    it('returns the input and generic archive URLs for the old live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(oldLiveUrl)).equal([
        oldLiveUrl,
        genericArchiveUrl,
      ])
    })

    it('returns the input URL for an unrelated path', () => {
      const url = `${base}/audio-space/master_playlist.m3u8`
      expect(PeriscopeUtil.getPlaylistUrlCandidates(url)).equal([url])
    })

    it('copies the cluster to the regional archive path', () => {
      const url = newLiveUrl.replace('x-media-live-stream-ap-northeast-1', 'x-media-live-stream-us-east-1')
      const candidates = PeriscopeUtil.getPlaylistUrlCandidates(url)
      expect(candidates[2]).contain('periscope-replay-direct-prod-us-east-1-public')
    })
  })

  describe('getChunks', () => {
    it('reads _a and _b chunk indexes', () => {
      const data = [
        '#EXTM3U',
        'chunk_123_0_a.aac',
        'chunk_456_1_b.aac',
      ].join('\n')
      expect(PeriscopeUtil.getChunks(data)).equal([0, 1])
    })
  })
})

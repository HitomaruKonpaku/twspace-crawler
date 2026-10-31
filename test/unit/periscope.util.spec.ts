import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { PeriscopeUtil } from '../../src/utils/periscope.util'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

const base = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const pBase = 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/TOKEN/non_transcode/ap-northeast-1'
const newLiveUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const oldLiveUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const genericArchiveUrl = `${base}/periscope-replays-public/audio-space/master_playlist.m3u8`
const pNewLiveUrl = `${pBase}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const pOldLiveUrl = `${pBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const pGenericArchiveUrl = `${pBase}/periscope-replays-public/audio-space/master_playlist.m3u8`

describe('PeriscopeUtil', () => {
  describe('isFinalPlaylistUrl', () => {
    it('returns true for a final replay playlist', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_16752359708553501999.m3u8`
      expect(PeriscopeUtil.isFinalPlaylistUrl(url)).true()
    })

    it('returns true for a video space playlist', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_dynamic_123.m3u8`
      expect(PeriscopeUtil.isFinalPlaylistUrl(url)).true()
    })

    it('returns false for a master playlist', () => {
      expect(PeriscopeUtil.isFinalPlaylistUrl(newLiveUrl)).false()
    })
  })

  describe('getFinalPlaylistName', () => {
    it('returns the playlist name from a playlist body', () => {
      const data = [
        '#EXTM3U',
        '#EXT-X-STREAM-INF:BANDWIDTH=64000',
        'playlist_16752359708553501999.m3u8?type=replay',
      ].join('\n')
      expect(PeriscopeUtil.getFinalPlaylistName(data)).equal('playlist_16752359708553501999')
    })

    it('throws when the playlist body has no playlist name', () => {
      expect(() => PeriscopeUtil.getFinalPlaylistName('#EXTM3U')).throw()
    })
  })

  describe('getMasterPlaylistUrl', () => {
    it('converts a live dynamic playlist URL', () => {
      const url = `${base}/x-media-live-stream-ap-northeast-1/audio-space/dynamic_playlist.m3u8?type=live`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).equal(newLiveUrl)
    })

    it('converts a final replay playlist URL', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_16752359708553501999.m3u8?type=replay`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).equal(oldLiveUrl)
    })

    it('converts a video space playlist URL', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_dynamic_123.m3u8`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).equal(
        `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_master_playlist.m3u8`,
      )
    })
  })

  describe('getPlaylistUrlCandidates', () => {
    it('returns the live, generic archive, and regional archive URLs for the new live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(newLiveUrl)).equal([
        newLiveUrl,
        genericArchiveUrl,
        oldLiveUrl,
        pNewLiveUrl,
        pGenericArchiveUrl,
        pOldLiveUrl,
      ])
    })

    it('returns the input and generic archive URLs for the old live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(oldLiveUrl)).equal([
        oldLiveUrl,
        genericArchiveUrl,
        pOldLiveUrl,
        pGenericArchiveUrl,
      ])
    })

    it('returns the input URL for an unrelated path', () => {
      const url = `${base}/audio-space/master_playlist.m3u8`
      const pUrl = `${pBase}/audio-space/master_playlist.m3u8`
      expect(PeriscopeUtil.getPlaylistUrlCandidates(url)).equal([url, pUrl])
    })

    it('returns the path candidates for a prod-fastly-p URL', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(pNewLiveUrl)).equal([
        pNewLiveUrl,
        pGenericArchiveUrl,
        pOldLiveUrl,
      ])
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

import { PeriscopeUtil } from '../../src/utils/periscope.util'

// [Space ID, legacy replay URL, expected URL]. Add more spaces here.
const replayCases: [string, string, string][] = [
  [
    '1yoJMWvbybNKQ',
    'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
    'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
  ],
  [
    '1BRJjnMoYPBJw',
    'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/PbiS3ddPLFHjo-75g8JXutkbFNYE3_Q8UXVfuIk5GE91edE5Sux-kBZgg9kV0QpMyA6Z0ITsMMioKcqlMUvjQA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
    'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/PbiS3ddPLFHjo-75g8JXutkbFNYE3_Q8UXVfuIk5GE91edE5Sux-kBZgg9kV0QpMyA6Z0ITsMMioKcqlMUvjQA/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
  ],
  [
    '1dRJZlkOvDMKB',
    'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/6a80oV0miwDXYBX5mbKed16s-oIWfI3piS9LNOOEqxbur6QeSrmJA3r_fybRJLH-2iTC5geKXDbuDhblfvASUg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
    'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/6a80oV0miwDXYBX5mbKed16s-oIWfI3piS9LNOOEqxbur6QeSrmJA3r_fybRJLH-2iTC5geKXDbuDhblfvASUg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
  ],
  [
    '1YqJDoNBbOaGV',
    'https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/pmV9qwAbIbsP6VnwcSPDtazFyEuho0KDh6bs4YHD_-IDS5YaX0NXQEt874P4dtyU7R9bcOAJOG3lxtk9LqWXFw/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/master_playlist.m3u8',
    'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/pmV9qwAbIbsP6VnwcSPDtazFyEuho0KDh6bs4YHD_-IDS5YaX0NXQEt874P4dtyU7R9bcOAJOG3lxtk9LqWXFw/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/master_playlist.m3u8',
  ],
  [
    '1BRJjZgVZwoJw',
    'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/dEsQa71h5MUFTxIyTl4I8Z7Kv1Mm-lTTld5mYQ4pnQSh3cCa0UAQ-dp3xpmWltBCUIl7CyzsIEdTUqeesWZlCg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
    'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/dEsQa71h5MUFTxIyTl4I8Z7Kv1Mm-lTTld5mYQ4pnQSh3cCa0UAQ-dp3xpmWltBCUIl7CyzsIEdTUqeesWZlCg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
  ],
]

const base = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw/non_transcode/ap-northeast-1'
const fallbackBase = 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/1Nq1QFkYTQ4v1X4BTV_aJ_pFeQhYyuYXY7ykz5xB7v5NvGwFMJMKwnRBmxyi9twF4BZ90ZKks5wdGKqESVsjLw/non_transcode/ap-northeast-1'
const newLiveUrl = `${base}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const oldLiveUrl = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const genericArchiveUrl = `${base}/periscope-replays-public/audio-space/master_playlist.m3u8`
const fallbackNewLiveUrl = `${fallbackBase}/x-media-live-stream-ap-northeast-1/audio-space/master_playlist.m3u8`
const fallbackOldLiveUrl = `${fallbackBase}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8`
const fallbackGenericArchiveUrl = `${fallbackBase}/periscope-replays-public/audio-space/master_playlist.m3u8`

describe('PeriscopeUtil', () => {
  describe('getPlaylistLogDetails', () => {
    it('logs the host and known playlist name without credentials, path tokens or query parameters', () => {
      const url = 'https://user:password@cdn.example.test/b/TOKEN/JWT/audio-space/playlist_42.m3u8?sig=secret#fragment'
      expect(PeriscopeUtil.getPlaylistLogDetails(url)).toEqual({
        host: 'cdn.example.test',
        playlist: 'playlist_42.m3u8',
      })
    })

    it('omits unrecognized filenames and does not echo invalid URLs', () => {
      expect(PeriscopeUtil.getPlaylistLogDetails('https://cdn.example.test/SECRET.m3u8')).toEqual({
        host: 'cdn.example.test',
        playlist: undefined,
      })
      expect(PeriscopeUtil.getPlaylistLogDetails('SECRET')).toEqual({ invalidUrl: true })
    })
  })

  describe('isFinalPlaylistUrl', () => {
    it('returns true for a final replay playlist', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_16752359708553501999.m3u8`
      expect(PeriscopeUtil.isFinalPlaylistUrl(url)).toBe(true)
    })

    it('returns true for a video space playlist', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_dynamic_123.m3u8`
      expect(PeriscopeUtil.isFinalPlaylistUrl(url)).toBe(true)
    })

    it('returns false for a master playlist', () => {
      expect(PeriscopeUtil.isFinalPlaylistUrl(newLiveUrl)).toBe(false)
    })
  })

  describe('getChunkUrlCandidates', () => {
    const origin = 'https://example.test'
    const jwt = 'header.' + 'payload'.repeat(20) + '.signature'
    const archive = '/Transcoding/v1/hls/TOKEN/transcode/region/archive'
    const directory = `/b${archive}/${jwt}/audio-space/nested/`
    const playlist = `${origin}${directory}playlist_1.m3u8?sig=playlist`

    it('uses the resolved playlist directory including its /b/ and token components', () => {
      expect(PeriscopeUtil.getChunkPrefix(playlist)).toBe(origin + directory)
      expect(PeriscopeUtil.getChunkUrlCandidates(playlist, 'chunk_123_0_b.aac?sig=chunk')).toEqual([
        `${origin}${directory}chunk_123_0_b.aac?sig=chunk`,
        `${origin}/b${archive.replace('/transcode/', '/non_transcode/')}/audio-space/chunk_123_0_b.aac?sig=chunk`,
        `${origin}${archive.replace('/transcode/', '/non_transcode/')}/audio-space/chunk_123_0_b.aac?sig=chunk`,
      ])
    })

    it.each([
      ['../chunks/chunk_123_0_b.aac?sig=a%2Fb', `${origin}/b${archive}/${jwt}/audio-space/chunks/chunk_123_0_b.aac?sig=a%2Fb`],
      ['/chunks/chunk_123_0_b.aac?sig=abc', `${origin}/chunks/chunk_123_0_b.aac?sig=abc`],
      ['https://cdn.example.test/chunks/chunk_123_0_b.aac?sig=abc', 'https://cdn.example.test/chunks/chunk_123_0_b.aac?sig=abc'],
    ])('preserves the segment URI %s', (uri, expected) => {
      expect(PeriscopeUtil.getChunkUrlCandidates(playlist, uri)).toEqual([expected])
    })

    it('keeps a conventional audio-space chunk next to its playlist', () => {
      const chunk = 'chunk_123_0_a.aac'
      expect(PeriscopeUtil.getChunkUrlCandidates(newLiveUrl, chunk)).toEqual([new URL(chunk, newLiveUrl).href])
    })
  })

  describe('getMasterPlaylistUrl', () => {
    it('converts a live dynamic playlist URL', () => {
      const url = `${base}/x-media-live-stream-ap-northeast-1/audio-space/dynamic_playlist.m3u8?type=live`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).toEqual(newLiveUrl)
    })

    it('converts a final replay playlist URL', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_16752359708553501999.m3u8?type=replay`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).toEqual(oldLiveUrl)
    })

    it('converts a video space playlist URL', () => {
      const url = `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_dynamic_123.m3u8`
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).toEqual(
        `${base}/periscope-replay-direct-prod-ap-northeast-1-public/video-space/master_master_playlist.m3u8`,
      )
    })

    it('keeps a master playlist URL unchanged', () => {
      const url = replayCases[0][1]
      expect(PeriscopeUtil.getMasterPlaylistUrl(url)).toEqual(url)
    })

    it('changes only the playlist filename and the type parameter', () => {
      const origin = 'https://example.test/playlist_12/dynamic_playlist.m3u8?sig=a%2Fb&type=live&path=playlist_12'
      expect(PeriscopeUtil.getMasterPlaylistUrl(origin)).toEqual(
        'https://example.test/playlist_12/master_playlist.m3u8?sig=a%2Fb&path=playlist_12',
      )
    })
  })

  describe('getPlaylistUrlCandidates', () => {
    it.each(replayCases)(
      'returns the prod-fastly-p fallback URL first for a %s replay URL',
      (_, url, fallbackUrl) => {
        expect(PeriscopeUtil.getPlaylistUrlCandidates(url)[0]).toEqual(fallbackUrl)
        expect(PeriscopeUtil.getPlaylistUrlCandidates(fallbackUrl)[0]).toEqual(fallbackUrl)
      },
    )

    it('returns the fallback host URLs first for the new live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(newLiveUrl)).toEqual([
        fallbackNewLiveUrl,
        fallbackGenericArchiveUrl,
        fallbackOldLiveUrl,
        newLiveUrl,
        genericArchiveUrl,
        oldLiveUrl,
      ])
    })

    it('copies the cluster to the regional archive path', () => {
      const url = newLiveUrl.replace('x-media-live-stream-ap-northeast-1', 'x-media-live-stream-us-east-1')
      const candidates = PeriscopeUtil.getPlaylistUrlCandidates(url)
      expect(candidates[2]).toContain('periscope-replay-direct-prod-us-east-1-public')
    })

    it('returns the path candidates for a prod-fastly-p URL', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(fallbackNewLiveUrl)).toEqual([
        fallbackNewLiveUrl,
        fallbackGenericArchiveUrl,
        fallbackOldLiveUrl,
      ])
    })

    it('returns the fallback host URLs first for the old live path', () => {
      expect(PeriscopeUtil.getPlaylistUrlCandidates(oldLiveUrl)).toEqual([
        fallbackOldLiveUrl,
        fallbackGenericArchiveUrl,
        oldLiveUrl,
        genericArchiveUrl,
      ])
    })

    it('returns the input URL for an unrelated path', () => {
      const url = `${base}/audio-space/master_playlist.m3u8`
      const fallbackUrl = `${fallbackBase}/audio-space/master_playlist.m3u8`
      expect(PeriscopeUtil.getPlaylistUrlCandidates(url)).toEqual([fallbackUrl, url])
    })
  })

  describe('getFallbackHostUrl', () => {
    it('rewrites a regional host to prod-fastly-p', () => {
      expect((PeriscopeUtil as any).getFallbackHostUrl(newLiveUrl)).toEqual(fallbackNewLiveUrl)
    })

    it('keeps a prod-fastly-p host unchanged', () => {
      expect((PeriscopeUtil as any).getFallbackHostUrl(fallbackNewLiveUrl)).toEqual(fallbackNewLiveUrl)
    })
  })

  describe('getPathCandidates', () => {
    it('returns the live, generic archive, and regional archive paths for a live path', () => {
      expect((PeriscopeUtil as any).getPathCandidates(newLiveUrl)).toEqual([
        newLiveUrl,
        genericArchiveUrl,
        oldLiveUrl,
      ])
    })

    it('returns the URL and generic archive path for a replay path', () => {
      expect((PeriscopeUtil as any).getPathCandidates(oldLiveUrl)).toEqual([
        oldLiveUrl,
        genericArchiveUrl,
      ])
    })

    it('returns only the URL for an unrelated path', () => {
      const url = `${base}/audio-space/master_playlist.m3u8`
      expect((PeriscopeUtil as any).getPathCandidates(url)).toEqual([url])
    })

    it('does not rewrite archive-looking text in a query string', () => {
      const url = 'https://example.test/master.m3u8?path=/x-media-live-stream-us-east-1/'
      expect(PeriscopeUtil.getPlaylistUrlCandidates(url)).toEqual([url])
    })
  })

  describe('getChunks', () => {
    it('reads _a and _b chunk indexes', () => {
      const data = [
        '#EXTM3U',
        'chunk_123_0_a.aac',
        'chunk_456_1_b.aac',
      ].join('\n')
      expect(PeriscopeUtil.getChunks(data)).toEqual([0, 1])
    })
  })
})

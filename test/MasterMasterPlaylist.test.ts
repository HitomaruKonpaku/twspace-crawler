import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { PeriscopeApi } from '../src/apis/PeriscopeApi'
import { PeriscopeUtil } from '../src/utils/PeriscopeUtil'

const lab = Lab.script()
const { describe, it, before } = lab
export { lab }

describe('Master Master Playlist (Video Spaces)', () => {
  describe('URL Conversion', () => {
    it('should convert master_master_playlist to master_playlist', () => {
      const url = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8'
      const expected = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8'

      const result = PeriscopeUtil.getMasterPlaylistUrl(url)
      expect(result).equal(expected)
    })

    it('should handle dynamic_playlist URL', () => {
      const url = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/dynamic_playlist.m3u8?type=live'
      const expected = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8'

      const result = PeriscopeUtil.getMasterPlaylistUrl(url)
      expect(result).equal(expected)
    })

    it('should not modify master_playlist URL', () => {
      const url = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8'

      const result = PeriscopeUtil.getMasterPlaylistUrl(url)
      expect(result).equal(url)
    })
  })

  describe('Playlist Parsing', () => {
    it('should extract audio-only stream from master_master_playlist content', () => {
      const playlistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=256000,CODECS="mp4a.40.2",AUDIO="audio-only"
audio-only/master_playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x360,CODECS="avc1.42c01e,mp4a.40.2"
low/master_playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720,CODECS="avc1.42c01f,mp4a.40.2"
high/master_playlist.m3u8`

      const baseUrl = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8'

      // Access private method for testing via reflection
      const extractStreamUrl = (PeriscopeApi as any).extractStreamUrl.bind(PeriscopeApi)
      const result = extractStreamUrl(playlistContent, baseUrl)

      expect(result).to.contain('audio-only/master_playlist.m3u8')
    })

    it('should fallback to video stream if no audio-only stream available', () => {
      const playlistContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x360,CODECS="avc1.42c01e,mp4a.40.2"
low/master_playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720,CODECS="avc1.42c01f,mp4a.40.2"
high/master_playlist.m3u8`

      const baseUrl = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8'

      const extractStreamUrl = (PeriscopeApi as any).extractStreamUrl.bind(PeriscopeApi)
      const result = extractStreamUrl(playlistContent, baseUrl)

      expect(result).to.contain('master_playlist.m3u8')
      expect(result).to.not.be.null()
    })
  })

  describe('Real World Example (Optional)', () => {
    // This test uses a real Twitter Space URL if provided via environment variable
    // Example: TEST_MASTER_MASTER_URL="https://..." npm test
    const testUrl = process.env.TEST_MASTER_MASTER_URL

    before(() => {
      if (!testUrl) {
        console.log('Skipping real-world test: Set TEST_MASTER_MASTER_URL environment variable to test with real Space')
      }
    })

    it('should successfully fetch and parse real master_master_playlist', { skip: !testUrl }, async () => {
      if (!testUrl) {
        return
      }

      console.log(`Testing with URL: ${testUrl}`)

      // Test the full flow
      const finalUrl = await PeriscopeApi.getFinalPlaylistUrl(testUrl)

      expect(finalUrl).to.be.a.string()
      expect(finalUrl).to.match(/playlist_\d+\.m3u8/)

      // Verify the final playlist is accessible
      const { status } = await axios.head(finalUrl)
      expect(status).equal(200)

      console.log(`✓ Successfully resolved to: ${finalUrl}`)
    })

    it('should download chunks from resolved playlist', { skip: !testUrl }, async () => {
      if (!testUrl) {
        return
      }

      const finalUrl = await PeriscopeApi.getFinalPlaylistUrl(testUrl)
      const playlistData = await PeriscopeApi.getFinalPlaylist(testUrl)

      expect(playlistData).to.be.a.string()
      expect(playlistData).to.contain('#EXTM3U')

      // Check that chunks are listed in the playlist
      const chunks = PeriscopeUtil.getChunks(playlistData)
      expect(chunks.length).to.be.above(0)

      console.log(`✓ Found ${chunks.length} audio chunks in playlist`)
    })
  })

  describe('Integration Test Examples', () => {
    // These are example URLs that demonstrate the different playlist types
    // Note: These URLs may expire over time

    it('should document the URL structure for master_master_playlist', () => {
      const exampleUrl = 'https://prod-fastly-[region].video.pscp.tv/Transcoding/v1/hls/[hash]/non_transcode/[region]/periscope-replay-direct-prod-[region]-public/audio-space/master_master_playlist.m3u8'

      expect(exampleUrl).to.contain('master_master_playlist.m3u8')

      // Document: Video spaces use master_master_playlist instead of master_playlist
      console.log('\n📝 Video Space URL structure:')
      console.log('   master_master_playlist.m3u8 -> Contains references to audio/video streams')
      console.log('   └─> audio-only/master_playlist.m3u8 -> Contains playlist_XXXXX references')
      console.log('       └─> playlist_XXXXX.m3u8 -> Contains actual audio chunks')
    })

    it('should document how to obtain test URLs', () => {
      console.log('\n📝 How to obtain test URLs for video spaces:')
      console.log('   1. Find a live Twitter Space with video (check community.x.com or live spaces)')
      console.log('   2. Use the Twitter GraphQL API to get the media_key')
      console.log('   3. Use liveVideoStream/status endpoint to get the playlist URL')
      console.log('   4. If URL contains master_master_playlist, it\'s a video space')
      console.log('\n   Example Twitter Space with video:')
      console.log('   https://twitter.com/i/spaces/[SPACE_ID]')
      console.log('\n   To test with a real URL:')
      console.log('   TEST_MASTER_MASTER_URL="https://..." npm test')
    })
  })

  describe('Edge Cases', () => {
    it('should handle URLs with query parameters', () => {
      const url = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_master_playlist.m3u8?type=replay'

      const result = PeriscopeUtil.getMasterPlaylistUrl(url)
      expect(result).to.not.contain('?type=replay')
      expect(result).to.contain('master_playlist.m3u8')
    })

    it('should handle already-final playlist URLs', () => {
      const url = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/ABC123/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/playlist_12345.m3u8'

      expect(PeriscopeUtil.isFinalPlaylistUrl(url)).to.be.true()
    })
  })
})

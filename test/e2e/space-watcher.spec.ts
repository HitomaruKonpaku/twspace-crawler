import fs from 'fs'
import path from 'path'

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'

interface FixtureResponse {
  status: number
  body: any
}

interface HttpFixture extends FixtureResponse {
  url: string
}

interface Fixture {
  id: string
  capturedAt: string
  graphql: Record<string, FixtureResponse>
  http: HttpFixture[]
}

const fixturesDir = path.join(__dirname, '../data/e2e/watcher')
const workDir = path.join(path.resolve(__dirname, '../..'), '.tmp.e2e')

const spaces: { id: string, expected: 'complete' | 'failed', url?: string }[] = [
  { id: '1YqJDoNBbOaGV', expected: 'complete' },
  { id: '1DxleVAbWZNKL', expected: 'complete' },
  { id: '1nGnRBPAkzwGO', expected: 'failed' },
  { id: '1nGnRBPAkzwGO', expected: 'complete', url: 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/z8OYQtxWqmbwMJanM59y3ls2ydrIpdoAdZ5w3NqcwAeHntRZPVoLtYuDmQXoBH4FPnmfXbSkBwycDCxsRM4l4g/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8' },
  { id: '1kKzDPRrjpXJv', expected: 'failed' },
  { id: '1kKzDPRrjpXJv', expected: 'complete', url: 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/1SzYY4MFqJ1DfWVviciqfA87VDTn5C5wL4orgxjA9FROc0sAUbw64NgdK_mINNHP8KDNPYhHOkl_5ORtft8tRg/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8' },
]

let axios: any
let program: any
let api: any
let SpaceWatcher: any
let SpaceDownloader: any

let fixtures: Fixture
let requests: string[] = []
let originalAdapters: Record<string, any>
let originalDownloadChunks: any
let originalSpawnFfmpeg: any
let originalCwd: string

const toFullUrl = (config: any) => {
  if (/^https?:\/\//.test(config.url)) {
    return config.url
  }
  return `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`
}

const findFixture = (config: any) => {
  if (config.baseURL?.includes('/graphql')) {
    const operation = Object.keys(fixtures.graphql)
      .find((name) => config.url.endsWith(`/${name}`))
    return operation && fixtures.graphql[operation]
  }
  const url = toFullUrl(config)
  return fixtures.http.find((item) => item.url === url)
}

const fixtureAdapter = async (config: any) => {
  const url = toFullUrl(config)
  requests.push(url)

  const fixture = findFixture(config)
  if (!fixture) {
    throw new Error(`No fixture for request: ${url}`)
  }

  const response = {
    data: fixture.body,
    status: fixture.status,
    statusText: `${fixture.status}`,
    headers: {},
    config,
    request: {},
  }

  if (fixture.status >= 400) {
    const error: any = new Error(`Request failed with status code ${fixture.status}`)
    error.config = config
    error.response = response
    throw error
  }

  return response
}

const loadFixture = (id: string) => {
  const file = path.join(fixturesDir, `${id}.json`)
  fixtures = JSON.parse(fs.readFileSync(file, 'utf8'))
  requests = []

  // These replays captured the media body from the old sibling URL. Replay that
  // body at the URI advertised by the master so the expected request follows HLS.
  const master = fixtures.http.find((item) => item.url.endsWith('/master_playlist.m3u8'))
  if (master) {
    const uris = master.body.split('\n').filter((line: string) => line.startsWith('/b/'))
    const uri = uris[uris.length - 1]
    const media = fixtures.http.find((item) => /\/playlist_\d+\.m3u8$/.test(item.url))
    if (uri && media) {
      media.url = new URL(uri, master.url).href
    }
  }
}

const watch = async (id: string, url?: string) => {
  program.setOptionValue('url', url)
  try {
    const watcher = new SpaceWatcher(id)
    const event = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timeout: ${requests.join(', ')}`)), 10000)
      watcher.once('complete', () => {
        clearTimeout(timer)
        resolve('complete')
      })
      watcher.once('failed', () => {
        clearTimeout(timer)
        resolve('failed')
      })
      watcher.watch()
    })
    return { event, requests: [...requests] }
  } finally {
    program.setOptionValue('url', undefined)
  }
}

beforeAll(() => {
  originalCwd = process.cwd()
  fs.mkdirSync(workDir, { recursive: true })
  process.chdir(workDir)
  process.env.SKIP_DOWNLOAD_CAPTION = '1'

  axios = require('axios')
  program = require('commander').program
  api = require('../../src/api/twitter.api').api
  SpaceWatcher = require('../../src/modules/space-watcher').SpaceWatcher
  SpaceDownloader = require('../../src/modules/space-downloader').SpaceDownloader

  originalAdapters = {
    axios: axios.defaults.adapter,
    graphql: api.graphql.client.defaults.adapter,
    liveVideoStream: api.liveVideoStream.client.defaults.adapter,
  }
  axios.defaults.adapter = fixtureAdapter
  api.graphql.client.defaults.adapter = fixtureAdapter
  api.liveVideoStream.client.defaults.adapter = fixtureAdapter

  api.transaction.generateTransactionId = async () => 'test'

  originalDownloadChunks = SpaceDownloader.prototype.downloadChunks
  originalSpawnFfmpeg = SpaceDownloader.prototype.spawnFfmpeg
  SpaceDownloader.prototype.downloadChunks = async () => { }
  SpaceDownloader.prototype.spawnFfmpeg = async () => { }
})

afterAll(() => {
  axios.defaults.adapter = originalAdapters.axios
  api.graphql.client.defaults.adapter = originalAdapters.graphql
  api.liveVideoStream.client.defaults.adapter = originalAdapters.liveVideoStream
  delete api.transaction.generateTransactionId

  SpaceDownloader.prototype.downloadChunks = originalDownloadChunks
  SpaceDownloader.prototype.spawnFfmpeg = originalSpawnFfmpeg

  delete process.env.SKIP_DOWNLOAD_CAPTION
  process.chdir(originalCwd)
  fs.rmSync(workDir, { recursive: true, force: true })
})

describe('SpaceWatcher', () => {
  spaces.forEach(({ id, expected, url }) => {
    describe(`${id}${url ? ' with a master playlist url' : ''}`, () => {
      it(`should ${expected}`, async () => {
        loadFixture(id)
        const result = await watch(id, url)

        expect(result.event).toEqual(expected)
        expect(result.requests.some((request) => request.includes('/AudioSpaceById'))).toBe(true)
        expect(result.requests.some((request) => request.includes('/AudiospaceByRestId'))).toBe(true)

        const httpRequests = result.requests.filter((request) => !request.includes('/graphql'))
        // A url run goes straight to the downloader, so it only requests playlists.
        const expectedHttp = expected === 'failed'
          ? []
          : fixtures.http
            .filter((item) => !item.url.includes('accessChatPublic'))
            .filter((item) => !url || item.url.includes('.m3u8'))
            .map((item) => item.url)
        expect(httpRequests).toEqual(expectedHttp)
      }, 15000)
    })
  })

  it('retries an unavailable playlist and completes when it becomes available', async () => {
    jest.useFakeTimers()
    try {
      const { PlaylistCandidatesError } = require('../../src/apis/periscope-api')
      const watcher = new SpaceWatcher('retry-test')
      const download = jest.fn().mockRejectedValueOnce(new PlaylistCandidatesError([])).mockResolvedValueOnce(undefined)
      watcher.downloader = { download }
      const complete = jest.fn()
      const failed = jest.fn()
      watcher.on('complete', complete)
      watcher.on('failed', failed)

      await watcher.downloadAudio()
      expect(failed).not.toHaveBeenCalled()
      await jest.advanceTimersByTimeAsync(10000)
      expect(download).toHaveBeenCalledTimes(2)
      expect(complete).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })

  it('eventually fails when the playlist remains unavailable', async () => {
    jest.useFakeTimers()
    try {
      const { PlaylistCandidatesError } = require('../../src/apis/periscope-api')
      const watcher = new SpaceWatcher('retry-test')
      const download = jest.fn().mockRejectedValue(new PlaylistCandidatesError([]))
      watcher.downloader = { download }
      const failed = jest.fn()
      watcher.on('failed', failed)

      await watcher.downloadAudio()
      await jest.advanceTimersByTimeAsync(60000)
      expect(download).toHaveBeenCalledTimes(7)
      expect(failed).toHaveBeenCalledTimes(1)
    } finally {
      jest.useRealTimers()
    }
  })
})

describe('SpaceDownloader', () => {
  it('downloads the full segment URI and rewrites it to a local filename for FFmpeg', async () => {
    const master = 'https://example.test/archive/master_playlist.m3u8'
    const media = 'https://example.test/b/Transcoding/v1/hls/TOKEN/transcode/region/archive/JWT/audio-space/nested/playlist_1.m3u8?sig=media'
    const segmentUri = '../chunks/chunk_123_0_b.aac?sig=a%2Fb'
    const segment = new URL(segmentUri, media).href
    const bytes = Buffer.from('test audio')
    const masterBody = `#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=128000\n${new URL(media).pathname}?sig=media\n`
    const mediaBody = `#EXTM3U\n#EXTINF:10,\n${segmentUri}\n`
    loadFixture('1YqJDoNBbOaGV')
    fixtures.http = [
      { url: master, status: 200, body: masterBody },
      { url: media, status: 200, body: mediaBody },
      { url: segment, status: 200, body: bytes },
    ]

    SpaceDownloader.prototype.downloadChunks = originalDownloadChunks
    const ffmpeg = jest.spyOn(SpaceDownloader.prototype, 'spawnFfmpeg').mockImplementation(async function (input: string) {
      const playlist = fs.readFileSync(path.join(this.tmpDir, input), 'utf8')
      expect(playlist).toBe(mediaBody.replace(segmentUri, 'chunk_0.aac'))
      expect(fs.readFileSync(path.join(this.tmpDir, 'chunk_0.aac'))).toEqual(bytes)
    })
    try {
      await new SpaceDownloader(master, 'audio-fixture').download()
      expect(requests).toEqual([master, media, segment])
      expect(ffmpeg).toHaveBeenCalledTimes(1)
    } finally {
      ffmpeg.mockRestore()
      SpaceDownloader.prototype.downloadChunks = async () => { }
    }
  })

  it('passes the resolved video variant URL to FFmpeg', async () => {
    const master = 'https://example.test/generic/master.m3u8'
    const media = 'https://cdn.example.test/nested/high.m3u8?sig=video'
    loadFixture('1YqJDoNBbOaGV')
    fixtures.http = [
      { url: master, status: 200, body: [
        '#EXTM3U',
        '#EXT-X-STREAM-INF:BANDWIDTH=100000,RESOLUTION=320x240',
        'low.m3u8',
        '#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x480',
        media,
      ].join('\n') },
      { url: media, status: 200, body: '#EXTM3U\n#EXTINF:10,\nsegment.ts\n' },
    ]

    const ffmpeg = jest.spyOn(SpaceDownloader.prototype, 'spawnFfmpeg')
    try {
      await new SpaceDownloader(master, 'video-fixture').download()
      expect(requests).toEqual([master, media])
      expect(ffmpeg).toHaveBeenCalledWith(media)
    } finally {
      ffmpeg.mockRestore()
    }
  })
})

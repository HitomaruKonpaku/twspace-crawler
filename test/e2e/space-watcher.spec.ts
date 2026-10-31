import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import fs from 'fs'
import path from 'path'

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'

const lab = Lab.script()
const { describe, it, before, after } = lab
export { lab }

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

const fixturesDir = path.join(__dirname, '../data/e2e')
const workDir = path.join(path.resolve(__dirname, '../..'), '.tmp.e2e')

const masterUrl = 'https://prod-fastly-ap-northeast-1.video.pscp.tv/Transcoding/v1/hls/z8OYQtxWqmbwMJanM59y3ls2ydrIpdoAdZ5w3NqcwAeHntRZPVoLtYuDmQXoBH4FPnmfXbSkBwycDCxsRM4l4g/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8'

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

before(() => {
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
  SpaceDownloader.prototype.downloadChunks = async () => {}
  SpaceDownloader.prototype.spawnFfmpeg = async () => {}
})

after(() => {
  axios.defaults.adapter = originalAdapters.axios
  api.graphql.client.defaults.adapter = originalAdapters.graphql
  api.liveVideoStream.client.defaults.adapter = originalAdapters.liveVideoStream
  delete api.transaction.generateTransactionId

  SpaceDownloader.prototype.downloadChunks = originalDownloadChunks
  SpaceDownloader.prototype.spawnFfmpeg = originalSpawnFfmpeg

  delete process.env.SKIP_DOWNLOAD_CAPTION
  process.chdir(originalCwd)
})

describe('SpaceWatcher', () => {
  it('downloads an old archived Space by id', { timeout: 15000 }, async () => {
    loadFixture('1YqJDoNBbOaGV')
    const result = await watch('1YqJDoNBbOaGV')

    expect(result.event).equal('complete')
    expect(result.requests.some((url) => url.includes('/AudioSpaceById'))).true()
    expect(result.requests.some((url) => url.includes('/AudiospaceByRestId'))).true()

    const statusUrl = result.requests.find((url) => url.includes('/live_video_stream/status/'))
    expect(statusUrl).exist()

    const statusFixture = fixtures.http.find((item) => item.url === statusUrl)
    const location = statusFixture.body.source.location
    const playlistRequests = result.requests.filter((url) => url.includes('.m3u8'))
    expect(playlistRequests).equal([location])

    expect(result.requests.some((url) => url.includes('accessChatPublic'))).true()
  })

  it('fails by id when the Space archive is not available', { timeout: 15000 }, async () => {
    loadFixture('1nGnRBPAkzwGO')
    const result = await watch('1nGnRBPAkzwGO')

    expect(result.event).equal('failed')
    expect(result.requests.some((url) => url.includes('/AudioSpaceById'))).true()
    expect(result.requests.some((url) => url.includes('/AudiospaceByRestId'))).true()
    expect(result.requests.some((url) => url.includes('/live_video_stream/'))).false()
    expect(result.requests.some((url) => url.includes('.m3u8'))).false()
    expect(result.requests.some((url) => url.includes('accessChatPublic'))).false()
  })

  it('downloads with a master playlist url after the CDN host fallback', { timeout: 15000 }, async () => {
    loadFixture('1nGnRBPAkzwGO')
    const result = await watch('1nGnRBPAkzwGO', masterUrl)

    expect(result.event).equal('complete')

    const playlistRequests = result.requests.filter((url) => url.includes('.m3u8'))
    expect(playlistRequests.length).equal(4)
    expect(playlistRequests[0]).equal(masterUrl)
    expect(playlistRequests[1]).contain('prod-fastly-ap-northeast-1.video.pscp.tv')
    expect(playlistRequests[1]).contain('periscope-replays-public')
    expect(playlistRequests[2]).contain('prod-fastly-p.video.pscp.tv')
    expect(playlistRequests[2]).contain('master_playlist.m3u8')
    expect(playlistRequests[3]).contain('prod-fastly-p.video.pscp.tv')
    expect(playlistRequests[3]).contain('/audio-space/playlist_')
  })
})

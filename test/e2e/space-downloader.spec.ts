import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from 'fs'
import path from 'path'

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'

interface DownloadCase {
  id: string
  url: string
}

const cases: DownloadCase[] = [
  {
    id: '1YqJDoNBbOaGV',
    url: 'https://prod-fastly-us-east-1.video.pscp.tv/Transcoding/v1/hls/pmV9qwAbIbsP6VnwcSPDtazFyEuho0KDh6bs4YHD_-IDS5YaX0NXQEt874P4dtyU7R9bcOAJOG3lxtk9LqWXFw/non_transcode/us-east-1/periscope-replay-direct-prod-us-east-1-public/audio-space/master_playlist.m3u8',
  },
  {
    id: '1nGnRBPAkzwGO',
    url: 'https://prod-fastly-p.video.pscp.tv/Transcoding/v1/hls/z8OYQtxWqmbwMJanM59y3ls2ydrIpdoAdZ5w3NqcwAeHntRZPVoLtYuDmQXoBH4FPnmfXbSkBwycDCxsRM4l4g/non_transcode/ap-northeast-1/periscope-replay-direct-prod-ap-northeast-1-public/audio-space/master_playlist.m3u8',
  },
]

const fixturesDir = path.join(__dirname, '../data/e2e/download')
const workDir = path.join(path.resolve(__dirname, '../..'), '.tmp.download.e2e')

let axios: any
let SpaceDownloader: any
let configManager: any

let originalAdapter: any
let originalSpawnFfmpeg: any
let originalCwd: string
let activeCase: DownloadCase
let ffmpegInputs: string[] = []

const fixtureAdapter = async (config: any) => {
  const name = new URL(config.url).pathname.split('/').pop()
  const file = path.join(fixturesDir, activeCase.id, name)
  if (!existsSync(file)) {
    throw new Error(`No fixture for request: ${config.url}`)
  }

  const data = config.responseType === 'arraybuffer'
    ? readFileSync(file)
    : readFileSync(file, 'utf8')

  return {
    data,
    status: 200,
    statusText: '200',
    headers: {},
    config,
    request: {},
  }
}

beforeAll(() => {
  originalCwd = process.cwd()
  mkdirSync(workDir, { recursive: true })
  process.chdir(workDir)

  axios = require('axios')
  SpaceDownloader = require('../../src/modules/space-downloader').SpaceDownloader
  configManager = require('../../src/modules/config-manager').configManager

  originalAdapter = axios.defaults.adapter
  axios.defaults.adapter = fixtureAdapter

  originalSpawnFfmpeg = SpaceDownloader.prototype.spawnFfmpeg
  SpaceDownloader.prototype.spawnFfmpeg = function (inp: string) {
    ffmpegInputs.push(inp)
    return originalSpawnFfmpeg.call(this, inp)
  }

  configManager.update({ ffmpeg: { audio: { extension: 'aac' } } })
})

beforeEach(() => {
  ffmpegInputs = []
})

afterAll(() => {
  axios.defaults.adapter = originalAdapter
  SpaceDownloader.prototype.spawnFfmpeg = originalSpawnFfmpeg
  process.chdir(originalCwd)
  rmSync(workDir, { recursive: true, force: true })
})

describe('SpaceDownloader', () => {
  cases.forEach((item) => {
    describe(item.id, () => {
      it('should download audio, not video, from a master playlist url', async () => {
        activeCase = item
        await new SpaceDownloader(item.url, item.id).download()

        const outputDir = path.join(workDir, 'download')
        const files = readdirSync(outputDir)
        expect(files).toContain(`${item.id}.aac`)
        expect(files.some((file) => file.endsWith('.mp4'))).toBe(false)

        const outputFile = path.join(outputDir, `${item.id}.aac`)
        expect(statSync(outputFile).size).toBeGreaterThan(0)

        // ADTS sync word: 12 set bits at the start of the file
        const header = readFileSync(outputFile).subarray(0, 2)
        expect(header[0]).toEqual(0xFF)
        expect(header[1] & 0xF0).toEqual(0xF0)

        // The video path passes the remote url to ffmpeg, the audio path passes the local playlist
        expect(ffmpegInputs).toEqual(['playlist.m3u8'])
      }, 30000)
    })
  })
})

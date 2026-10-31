/**
 * Builds an offline e2e fixture in test/data/e2e from a Space.
 *
 * Usage (`--` is required so npm passes the args to the script):
 *   npm run build-e2e-dataset -- <space-id>
 *   npm run build-e2e-dataset -- <space-id> [playlist-url]
 *
 * Examples:
 *   npm run build-e2e-dataset -- 1YqJDoNBbOaGV
 *   npm run build-e2e-dataset -- 1nGnRBPAkzwGO https://prod-fastly-ap-northeast-1.video.pscp.tv/.../master_playlist.m3u8
 *
 * The first arg is the Space ID. The optional second arg is a master playlist
 * URL, needed for an ended Space that has no live video stream.
 */

import axios from 'axios'
import { program } from 'commander'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { api } from '../src/api/twitter.api'
import { SpaceDownloader } from '../src/modules/space-downloader'
import { SpaceWatcher } from '../src/modules/space-watcher'

interface FixtureResponse {
  status: number
  body: any
  error?: string
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

const rootDir = path.resolve(__dirname, '../..')
const fixturesDir = path.join(rootDir, 'test/data/e2e')
const workDir = path.join(rootDir, '.tmp.e2e')
const timeout = 60000

const fixture: Fixture = {
  id: '',
  capturedAt: '',
  graphql: {},
  http: [],
}

const toFullUrl = (config: any) => {
  if (/^https?:\/\//.test(config.url)) {
    return config.url
  }
  return `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`
}

const isError = (status: number) => status >= 400

const capture = (response: any, error?: string) => {
  const { config, status, data } = response
  const record = error ? { status, body: data, error } : { status, body: data }
  if (config.baseURL?.includes('/graphql')) {
    const operation = config.url.split('?')[0].split('/').filter(Boolean).pop()
    const current = fixture.graphql[operation]
    if (!current || isError(current.status) || !isError(status)) {
      fixture.graphql[operation] = record
    }
    return
  }

  const url = toFullUrl(config)
  const index = fixture.http.findIndex((item) => item.url === url)
  if (index === -1) {
    fixture.http.push({ url, ...record })
  } else if (isError(fixture.http[index].status) && !isError(status)) {
    fixture.http[index] = { url, ...record }
  }
}

const watchOnce = (id: string) => new Promise<string>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
  const watcher = new SpaceWatcher(id)
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

const main = async () => {
  const [id, playlistUrl] = process.argv.slice(2)
  if (!id) {
    console.error('Usage: npm run build-e2e-dataset -- <space-id> [playlist-url]')
    process.exit(1)
  }

  fixture.id = id
  fixture.capturedAt = new Date().toISOString()

  fs.mkdirSync(workDir, { recursive: true })
  process.chdir(workDir)
  process.env.SKIP_DOWNLOAD_CAPTION = '1'

  const clients = [...new Set([axios, api.graphql.client, api.liveVideoStream.client])]
  clients.forEach((client) => {
    client.interceptors.response.use(
      (response) => {
        capture(response)
        return response
      },
      (error) => {
        if (error.response) {
          capture(error.response, error.message)
        }
        return Promise.reject(error)
      },
    )
  })

    // ponytail: download stubs, same as the spec. Extend if the dataset needs chunk data.
    ; (SpaceDownloader.prototype as any).downloadChunks = async () => { }
    ; (SpaceDownloader.prototype as any).spawnFfmpeg = async () => { }

  program.setOptionValue('url', playlistUrl)

  const requiredOperations = ['AudioSpaceById', 'AudiospaceByRestId']
  const missingOperations = () => requiredOperations.filter((operation) => {
    const response = fixture.graphql[operation]
    return !response || isError(response.status)
  })

  let event = ''
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    event = await watchOnce(id)
    const missing = missingOperations()
    if (!missing.length) {
      break
    }
    console.error(`Missing GraphQL responses: ${missing.join(', ')}`)
  }

  if (missingOperations().length) {
    throw new Error(`Missing GraphQL responses: ${missingOperations().join(', ')}`)
  }

  // Retry with the playlist url from the previous fixture when the archive is gone.
  if (!playlistUrl && event === 'failed') {
    let url: string | undefined
    try {
      const previous: Fixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, `${id}.json`), 'utf8'))
      url = previous.http?.find((item) => item.url.includes('.m3u8'))?.url
    } catch {
      // No previous fixture to reuse.
    }
    if (url) {
      console.log(`Retry with the previous playlist url: ${url}`)
      program.setOptionValue('url', url)
      event = await watchOnce(id)
    }
  }

  // A url run returns before the status call. Backfill it so both cases share one fixture.
  if (!fixture.http.some((item) => item.url.includes('/live_video_stream/status/'))) {
    const byId = fixture.graphql.AudioSpaceById?.body?.data?.audioSpace
    const byRestId = fixture.graphql.AudiospaceByRestId?.body?.data?.audio_space_by_rest_id
    const mediaKey = byId?.metadata?.media_key ?? byRestId?.metadata?.media_key
    if (mediaKey) {
      try {
        await api.liveVideoStream.status(mediaKey)
      } catch {
        // The error is the data we want. The interceptor records it.
      }
    }
  }

  const statusIndex = fixture.http.findIndex((item) => item.url.includes('/live_video_stream/status/'))
  if (statusIndex > 0) {
    const [status] = fixture.http.splice(statusIndex, 1)
    fixture.http.unshift(status)
  }

  const rank = (name: string) => ['AudioSpaceById', 'AudiospaceByRestId'].indexOf(name) + 1 || Number.MAX_SAFE_INTEGER
  const graphql = Object.fromEntries(
    Object.entries(fixture.graphql).sort(([a], [b]) => rank(a) - rank(b)),
  )

  const file = path.join(fixturesDir, `${id}.json`)
  fs.writeFileSync(file, JSON.stringify({ ...fixture, graphql }, null, 2))
  console.log(`${event}: ${file}`)
  console.log(`GraphQL: ${Object.keys(fixture.graphql).join(', ')}`)
  console.log(`HTTP: ${fixture.http.length}`)
  if (event === 'failed') {
    console.warn('WARNING: The Space is unavailable or not archived. Provide the playlist url if possible.')
  }
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

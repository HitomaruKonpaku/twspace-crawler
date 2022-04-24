import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { readFileSync } from 'fs'
import path from 'path'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

// const spaces = Array
//   // eslint-disable-next-line no-eval
//   .from<any>(eval(readFileSync(path.join(__dirname, 'data/spaces.ts'), { encoding: 'utf8' })))
//   .filter((space) => space.playlist_url)

const spaces = Array
  .from<any>(readFileSync(path.join(__dirname, '../logs/spaces.jsonl'), { encoding: 'utf8' }).trim().split('\n'))
  .filter((v) => v)
  .map((v) => JSON.parse(v))

describe('Space', () => {
  describe('Playlist Status', () => {
    const ids = new Set<string>()
    spaces.forEach((space) => {
      if (ids.has(space.id)) {
        return
      }
      ids.add(space.id)
      it(`@${space.username} (${space.id}) [${new Date(space.started_at).toISOString()}]`, async () => {
        const { status } = await axios.head(space.playlist_url)
        expect(status).equal(200)
      })
    })
  })
})

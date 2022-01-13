import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { readFileSync } from 'fs'
import path from 'path'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

const spaces = Array
  // eslint-disable-next-line no-eval
  .from<any>(eval(readFileSync(path.join(__dirname, 'data/spaces.ts'), { encoding: 'utf8' })))
  .filter((space) => space.playlist_url)

describe('Space', () => {
  describe('Playlist Duplication', () => {
    const set = new Set()
    spaces.forEach((space) => {
      it(`@${space.screen_name} (${space.id})`, () => {
        expect(set.has(space.playlist_url)).false()
        set.add(space.playlist_url)
      })
    })
  })

  describe('Playlist Status', () => {
    spaces.forEach((space) => {
      it(`@${space.screen_name} (${space.id})`, async () => {
        const { status } = await axios.head(space.playlist_url)
        expect(status).equal(200)
      })
    })
  })
})

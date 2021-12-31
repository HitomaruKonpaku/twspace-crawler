import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { spaces } from './data/TestSpace'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

describe('SpacePlaylistStatus', () => {
  spaces.filter((v) => v.playlist_url).forEach((space) => {
    it(`@${space.screen_name} (${space.id})`, async () => {
      const { status } = await axios.head(space.playlist_url)
      expect(status).to.equal(200)
    })
  })
})

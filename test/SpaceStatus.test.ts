import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import axios from 'axios'
import { spaces } from './Space'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

describe('[SpaceStatus]', () => {
  spaces.filter((v) => v.playlistUrl).forEach((space) => {
    it(`@${space.user} [${space.date}] (${space.id})`, async () => {
      const { status } = await axios.head(space.playlistUrl)
      expect(status).to.equal(200)
    })
  })
})

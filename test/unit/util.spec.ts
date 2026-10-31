import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Util } from '../../src/utils/util'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

describe('Util', () => {
  describe('isNewerVersion', () => {
    it('compares each version part as a number', () => {
      expect(Util.isNewerVersion('1.10.0', '1.9.0')).true()
      expect(Util.isNewerVersion('1.9.0', '1.10.0')).false()
    })

    it('returns false for the same version', () => {
      expect(Util.isNewerVersion('1.19.1', '1.19.1')).false()
      expect(Util.isNewerVersion('1.19', '1.19.0')).false()
    })

    it('compares major and patch versions', () => {
      expect(Util.isNewerVersion('2.0.0', '1.19.1')).true()
      expect(Util.isNewerVersion('1.19.2', '1.19.1')).true()
      expect(Util.isNewerVersion('1.19.1', '1.19.2')).false()
    })
  })
})

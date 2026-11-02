import path from 'path'
import { Util } from '../../src/utils/util'

describe('Util', () => {
  describe('isNewerVersion', () => {
    it('compares each version part as a number', () => {
      expect(Util.isNewerVersion('1.10.0', '1.9.0')).toBe(true)
      expect(Util.isNewerVersion('1.9.0', '1.10.0')).toBe(false)
    })

    it('returns false for the same version', () => {
      expect(Util.isNewerVersion('1.19.1', '1.19.1')).toBe(false)
      expect(Util.isNewerVersion('1.19', '1.19.0')).toBe(false)
    })

    it('compares major and patch versions', () => {
      expect(Util.isNewerVersion('2.0.0', '1.19.1')).toBe(true)
      expect(Util.isNewerVersion('1.19.2', '1.19.1')).toBe(true)
      expect(Util.isNewerVersion('1.19.1', '1.19.2')).toBe(false)
    })
  })

  describe('getMediaDir', () => {
    it('returns a sub directory under download', () => {
      expect(Util.getMediaDir('nakiriayame')).toBe(path.resolve(process.cwd(), 'download', 'nakiriayame'))
    })

    it('uses an absolute sub directory as is', () => {
      const dir = path.resolve('custom', 'nakiriayame')
      expect(Util.getMediaDir(dir)).toBe(dir)
    })
  })
})

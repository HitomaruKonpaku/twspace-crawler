import { BufferUtil } from '../../src/utils/buffer.util'

describe('BufferUtil', () => {
  describe('stripIgnoreBuffer', () => {
    it('removes bytes before the ignore buffer', () => {
      const data = Buffer.concat([Buffer.from('wrap'), BufferUtil.IGNORE_BUFFER, Buffer.from('audio')])
      expect(BufferUtil.stripIgnoreBuffer(data)).toEqual(Buffer.concat([BufferUtil.IGNORE_BUFFER, Buffer.from('audio')]))
    })

    it('keeps data that has no ignore buffer', () => {
      const data = Buffer.from('audio')
      expect(BufferUtil.stripIgnoreBuffer(data)).toEqual(data)
    })
  })
})

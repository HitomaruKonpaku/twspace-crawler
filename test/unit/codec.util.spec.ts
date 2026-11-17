import { CodecUtil } from '../../src/utils/codec.util'

describe('CodecUtil', () => {
  describe('isAudioCodec', () => {
    it.each([
      ['mp4a.40.2'],
      ['aac'],
      ['ac-3'],
      ['ec-3'],
      ['ac-4'],
      ['opus'],
      ['flac'],
      ['mp3'],
      ['alac'],
      ['MP4A.40.2'],
    ])('returns true for %s', (codec) => {
      expect(CodecUtil.isAudioCodec(codec)).toBe(true)
    })

    it.each([
      ['avc1.640015'],
      ['hvc1.1.6.L93.B0'],
      ['vp09.00.10.08'],
      ['av01.0.04M.08'],
      ['xmp4a.40.2'],
      ['aacx'],
      [''],
    ])('returns false for %s', (codec) => {
      expect(CodecUtil.isAudioCodec(codec)).toBe(false)
    })
  })

  describe('hasVideoCodec', () => {
    it.each([
      ['avc1.640015'],
      ['avc3.640015'],
      ['hvc1.1.6.L93.B0'],
      ['hev1.1.6.L93.B0'],
      ['vp8'],
      ['vp9'],
      ['vp09.00.10.08'],
      ['av01.0.04M.08'],
      ['mp4a.40.2, avc1.640015'],
    ])('returns true for %s', (codecs) => {
      expect(CodecUtil.hasVideoCodec(codecs)).toBe(true)
    })

    it.each([
      ['mp4a.40.2'],
      ['aac'],
      ['xavc1.640015'],
      [''],
      [undefined],
    ])('returns false for %s', (codecs) => {
      expect(CodecUtil.hasVideoCodec(codecs)).toBe(false)
    })
  })
})

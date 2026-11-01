import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { checkFfmpeg, parseFfmpegVersion } from '../../src/modules/ffmpeg-checker'

const lab = Lab.script()
const { describe, it } = lab
export { lab }

const createRunner = (stdout?: string) => async () => {
  if (!stdout) {
    throw new Error('ENOENT')
  }
  return { stdout }
}

const createLogger = () => {
  const messages: string[] = []
  return {
    messages,
    logger: {
      info: (message: string) => messages.push(message),
      warn: (message: string) => messages.push(message),
    },
  }
}

describe('ffmpeg-checker', () => {
  describe('parseFfmpegVersion', () => {
    it('parses the version from ffmpeg output', () => {
      const output = 'ffmpeg version 8.1.3 Copyright (c) 2000-2026 the FFmpeg developers\nbuilt with gcc 14.2.0'
      expect(parseFfmpegVersion(output)).equal('8.1.3')
    })

    it('returns undefined when the output has no version', () => {
      expect(parseFfmpegVersion('ffmpeg: not found')).undefined()
    })
  })

  describe('checkFfmpeg', () => {
    it('logs the version when ffmpeg is available', async () => {
      const { messages, logger } = createLogger()
      await checkFfmpeg(createRunner('ffmpeg version 8.1.3 Copyright (c) 2000-2026 the FFmpeg developers'), logger)
      expect(messages).equal(['ffmpeg version: 8.1.3'])
    })

    it('warns when ffmpeg is not found', async () => {
      const { messages, logger } = createLogger()
      await checkFfmpeg(createRunner(), logger)
      expect(messages).equal(['ffmpeg not found. Audio and video downloads will fail. Install ffmpeg and add it to PATH.'])
    })
  })
})

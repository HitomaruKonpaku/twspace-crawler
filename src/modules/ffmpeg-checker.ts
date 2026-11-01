import { execFile } from 'child_process'
import { promisify } from 'util'
import { logger } from '../logger'

const execFileAsync = promisify(execFile)

export const parseFfmpegVersion = (output: string) => output.match(/ffmpeg version (\S+)/)?.[1]

export const checkFfmpeg = async (
  run: (file: string, args: string[]) => Promise<{ stdout: string }> = execFileAsync,
  log: { info: (message: string) => void, warn: (message: string) => void } = logger,
) => {
  try {
    const { stdout } = await run('ffmpeg', ['-version'])
    log.info(`ffmpeg version: ${parseFfmpegVersion(stdout) || 'unknown'}`)
  } catch {
    log.warn('ffmpeg not found. Audio and video downloads will fail. Install ffmpeg and add it to PATH.')
  }
}

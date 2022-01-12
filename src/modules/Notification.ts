import { randomUUID } from 'crypto'
import fs from 'fs'
import nodeNotifier from 'node-notifier'
import open from 'open'
import path from 'path'
import winston from 'winston'
import { Downloader } from '../Downloader'
import { logger as baseLogger } from '../logger'
import { Util } from '../utils/Util'

export class Notification {
  private logger: winston.Logger

  constructor(
    private readonly notification: nodeNotifier.Notification,
    private readonly url: string,
  ) {
    this.logger = baseLogger.child({ label: '[Notification]' })
  }

  public async notify() {
    this.logger.debug('notify', { notification: this.notification, url: this.url })
    try {
      await this.downloadIcon()
      nodeNotifier.notify(this.notification, (error, response) => {
        this.logger.debug('Notification callback', { response, error })
        // Tested on win32/macOS, response can be undefined, activate, timeout
        if (!error && (!response || response === 'activate')) {
          open(this.url)
        }
      })
    } catch (error) {
      this.logger.debug(`notify: ${error.message}`)
    }
  }

  private async downloadIcon() {
    const url = this.notification.icon
    if (!url) {
      return
    }
    const requestId = randomUUID()
    try {
      const imgPathname = url.replace('https://pbs.twimg.com/', '')
      Util.createCacheDir(path.dirname(imgPathname))
      const imgPath = path.join(Util.getCacheDir(), imgPathname)
      this.notification.icon = imgPath
      if (fs.existsSync(imgPath)) {
        return
      }
      this.logger.debug('--> downloadIcon', { requestId, url })
      await Downloader.downloadImage(url, imgPath)
      this.logger.debug('<-- downloadIcon', { requestId })
    } catch (error) {
      this.logger.error(`downloadIcon: ${error.message}`, { requestId })
    }
  }
}

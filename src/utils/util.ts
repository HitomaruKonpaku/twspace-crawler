import fs from 'fs'
import path from 'path'
import { APP_CACHE_DIR, APP_DOWNLOAD_DIR, APP_USER_REFRESH_INTERVAL } from '../constants/app.constant'
import { configManager } from '../modules/config-manager'

export class Util {
  public static getTwitterAuthorization(): string {
    return process.env.TWITTER_AUTHORIZATION
  }

  public static getTwitterAuthToken(): string {
    return process.env.TWITTER_AUTH_TOKEN
  }

  public static getDisplayTime(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    const hours = Math.floor((ms / 1000 / 3600))
    const s = [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
    return s
  }

  public static getDateTimeString(ms?: number): string {
    const date = ms
      ? new Date(ms)
      : new Date()
    const s = date.toISOString()
      .replace(/[^\d]/g, '')
      .substring(2, 12)
    return s
  }

  public static getUserRefreshInterval(): number {
    const interval = Number(configManager.config.interval || APP_USER_REFRESH_INTERVAL)
    return interval
  }

  // ponytail: number-by-number compare, enough because npm latest tag is always X.Y.Z
  public static isNewerVersion(latest: string, current: string): boolean {
    const a = latest.split('.').map((v) => parseInt(v, 10))
    const b = current.split('.').map((v) => parseInt(v, 10))
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      const x = a[i] || 0
      const y = b[i] || 0
      if (x !== y) {
        return x > y
      }
    }
    return false
  }

  public static getCacheDir(subDir = ''): string {
    return path.join(process.cwd(), APP_CACHE_DIR, subDir || '')
  }

  public static createCacheDir(subDir = ''): string {
    return fs.mkdirSync(this.getCacheDir(subDir), { recursive: true })
  }

  public static getMediaDir(subDir = ''): string {
    return path.join(process.cwd(), APP_DOWNLOAD_DIR, subDir || '')
  }

  public static createMediaDir(subDir = ''): string {
    return fs.mkdirSync(this.getMediaDir(subDir), { recursive: true })
  }

  /**
   * @see https://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
   */
  public static getCleanFileName(name: string) {
    return name?.replace?.(/[/\\?*:|<>"]/g, '')
  }

  public static splitArrayIntoChunk<T>(arr: T[], chunkSize: number) {
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }
}

import fs from 'fs'
import path from 'path'
import { APP_CACHE_DIR, APP_MEDIA_DIR, APP_USER_REFRESH_INTERVAL } from '../constants/app.constant'
import { configManager } from '../modules/ConfigManager'

export class Util {
  public static getTwitterAuthorization(): string {
    return process.env.TWITTER_AUTHORIZATION
  }

  public static getTwitterAuthToken(): string {
    return process.env.TWITTER_AUTH_TOKEN
  }

  public static getTimeString(ms?: number): string {
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

  public static getCacheDir(subDir = ''): string {
    return path.join(__dirname, APP_CACHE_DIR, subDir || '')
  }

  public static createCacheDir(subDir = ''): string {
    return fs.mkdirSync(this.getCacheDir(subDir), { recursive: true })
  }

  public static getMediaDir(subDir = ''): string {
    return path.join(__dirname, APP_MEDIA_DIR, subDir || '')
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

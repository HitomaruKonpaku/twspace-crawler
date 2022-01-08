import fs from 'fs'
import path from 'path'
import { configManager } from '../ConfigManager'
import { APP_CACHE_DIR, APP_MEDIA_DIR, APP_USER_REFRESH_INTERVAL } from '../constants/app.constant'

export class Util {
  public static getTwitterAuthorization(): string {
    return process.env.TWITTER_AUTHORIZATION
  }

  public static getTwitterAuthToken(): string {
    return process.env.TWITTER_AUTH_TOKEN
  }

  public static getTimeString(): string {
    const date = new Date()
    const s = [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ].map((v) => String(v).padStart(2, '0').slice(-2)).join('')
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

  public static splitArrayIntoChunk<T>(arr: T[], chunkSize: number) {
    return [...Array(Math.ceil(arr.length / chunkSize))]
      .map(() => arr.splice(0, chunkSize))
  }
}

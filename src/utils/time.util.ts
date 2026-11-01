export class TimeUtil {
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
}

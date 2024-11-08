export class BooleanUtil {
  public static fromString(s: string): boolean {
    if (!s) return false
    return /^1|(?:true)$/i.test(s)
  }
}

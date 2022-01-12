export class TwitterUtil {
  public static getUserUrl(username: string) {
    return `https://twitter.com/${username}`
  }

  public static getSpaceUrl(spaceId: string) {
    return `https://twitter.com/i/spaces/${spaceId}`
  }
}

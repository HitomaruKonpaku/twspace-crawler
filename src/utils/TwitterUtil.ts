export class TwitterUtil {
  /**
   * Returns the URL of a Twitter user, provided their user name
   * @param {string} username - User name
   * @returns {string} User URL
   */
  public static getUserUrl(username: string) {
    return `https://twitter.com/${username}`
  }

  /**
   * Returns the URL of a Twitter Space, provided its identifier
   * @param {string} spaceId - Space identifier
   * @returns {string} Space URL
   */
  public static getSpaceUrl(spaceId: string) {
    return `https://twitter.com/i/spaces/${spaceId}`
  }

  /**
   * Returns the identifier of a Twitter Space, provided its URL
   * @param {string} spaceUrl - Space URL
   * @returns {?string} Space identifier
   */
  public static getSpaceId(spaceUrl: string): string | null {
    const matches = /(?:spaces\/)?([A-Za-z0-9_]{13})/i.exec(spaceUrl) || []
    return matches[1]
  }
}

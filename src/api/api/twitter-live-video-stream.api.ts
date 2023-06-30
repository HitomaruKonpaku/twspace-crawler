import { TwitterBaseApi } from '../base/twitter-base.api'

export class TwitterLiveVideoStreamApi extends TwitterBaseApi {
  public async status(mediaKey: string) {
    const url = `status/${mediaKey}`
    const headers = this.getAuthHeaders()
    const res = await this.client.get(url, {
      headers,
    })
    return res
  }
}

import { TwitterBaseApi } from '../base/twitter-base.api'

export class TwitterGuestApi extends TwitterBaseApi {
  public async activate(authorization: string) {
    const url = 'activate.json'
    const headers = { authorization }
    const res = await this.client.request({
      method: 'POST',
      url,
      headers,
    })
    return res
  }
}

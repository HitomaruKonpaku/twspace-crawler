import { TWITTER_PUBLIC_AUTHORIZATION } from '../../constants/twitter.constant'
import { TwitterBaseApi } from '../base/twitter-base.api'

export class TwitterGuestApi extends TwitterBaseApi {
  public async activate() {
    const url = 'activate.json'
    const headers = { authorization: TWITTER_PUBLIC_AUTHORIZATION }
    const res = await this.client.request({
      method: 'POST',
      url,
      headers,
    })
    return res
  }
}

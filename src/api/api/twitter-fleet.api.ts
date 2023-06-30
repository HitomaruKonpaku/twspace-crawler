/* eslint-disable camelcase */

import { TwitterBaseApi } from '../base/twitter-base.api'

export class TwitterFleetApi extends TwitterBaseApi {
  public async avatar_content(userIds: string[]) {
    const url = 'avatar_content'
    const headers = this.getAuthHeaders()
    const res = await this.client.get(url, {
      headers,
      params: {
        only_spaces: true,
        user_ids: userIds.join(','),
      },
    })
    return res
  }

  public async fleetline() {
    const url = 'fleetline'
    const headers = this.getAuthHeaders()
    const res = await this.client.get(url, {
      headers,
      params: {
        only_spaces: true,
      },
    })
    return res
  }
}

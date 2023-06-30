/* eslint-disable class-methods-use-this */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { TWITTER_API_URL, TWITTER_PUBLIC_AUTHORIZATION } from '../../constants/twitter.constant'
import { logger } from '../../logger'
import { TwitterApi } from '../twitter.api'

export class TwitterBaseApi {
  public client: AxiosInstance

  protected logger = logger.child({ context: 'TwitterApi' })

  constructor(
    protected readonly api: TwitterApi,
    path: string,
  ) {
    this.createClient(path)
  }

  protected async getGuestHeaders() {
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      'x-guest-token': await this.api.data.getGuestToken(),
    }
    return headers
  }

  protected getAuthHeaders() {
    const cookies = {
      auth_token: process.env.TWITTER_AUTH_TOKEN,
      ct0: process.env.TWITTER_CSRF_TOKEN,
    }
    const cookie = Object.keys(cookies)
      .filter((key) => cookies[key])
      .map((key) => `${key}=${cookies[key]}`)
      .join('; ')
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION,
      cookie,
      'x-csrf-token': process.env.TWITTER_CSRF_TOKEN,
    }
    return headers
  }

  private createClient(path: string) {
    const baseUrl = [TWITTER_API_URL, path].join('/')
    const client = axios.create({ baseURL: baseUrl })
    this.client = client

    client.interceptors.request.use(
      (config) => {
        this.logRequest(config)
        return config
      },
    )

    client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        return response
      },
      (error) => {
        this.logResponse(error.response)
        return Promise.reject(error)
      },
    )
  }

  private logRequest(config: AxiosRequestConfig) {
    const url = [config.baseURL, config.url]
      .join('/')
      .replace(TWITTER_API_URL, '')
    this.logger.debug(['-->', url].join(' '))
  }

  private logResponse(res: AxiosResponse) {
    if (!res?.config) {
      return
    }
    const url = [res.config.baseURL, res.config.url]
      .join('/')
      .replace(TWITTER_API_URL, '')
    const limit = Number(res.headers['x-rate-limit-limit'])
    if (!limit) {
      this.logger.debug(['<--', url].join(' '))
      return
    }
    const remaining = Number(res.headers['x-rate-limit-remaining'])
    const reset = Number(res.headers['x-rate-limit-reset'])
    this.logger.debug(['<--', url, limit, remaining, new Date(reset * 1000).toISOString()].join(' '))
  }
}

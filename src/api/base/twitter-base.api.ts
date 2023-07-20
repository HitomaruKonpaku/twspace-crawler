/* eslint-disable class-methods-use-this */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { logger } from '../../logger'
import { TwitterApi } from '../twitter.api'
import { TWITTER_API_URL, TWITTER_PUBLIC_AUTHORIZATION, TWITTER_PUBLIC_AUTHORIZATION_2 } from '../twitter.constant'

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

  protected async getGuestV2Headers() {
    const headers = {
      authorization: TWITTER_PUBLIC_AUTHORIZATION_2,
      'x-guest-token': await this.api.data.getGuestToken2(),
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
      async (config) => {
        this.logRequest(config)
        await this.handleRequest(config)
        return config
      },
      null,
    )

    client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        this.handleResponse(response)
        return response
      },
      (error) => {
        this.logResponse(error.response)
        this.handleResponse(error.response)
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

  private async handleRequest(config: AxiosRequestConfig) {
    try {
      const guestToken = config.headers['x-guest-token']
      if (guestToken) {
        const url = this.getRateLimitRequestUrl(config)
        const rateLimit = this.api.data.rateLimits[url]
        if (rateLimit && rateLimit.limit && rateLimit.remaining === 0) {
          const newGuestToken = config.headers.authorization === TWITTER_PUBLIC_AUTHORIZATION
            ? await this.api.data.getGuestToken(true)
            : await this.api.data.getGuestToken2(true)
          // eslint-disable-next-line no-param-reassign
          config.headers['x-guest-token'] = newGuestToken
        }
      }
    } catch (error) {
      this.logger.error(`handleRequest: ${error.message}`)
    }
  }

  private handleResponse(res: AxiosResponse) {
    const url = this.getRateLimitRequestUrl(res.config)
    const limit = Number(res.headers['x-rate-limit-limit'])
    const remaining = Number(res.headers['x-rate-limit-remaining'])
    const reset = Number(res.headers['x-rate-limit-reset'])
    if (limit) {
      const { rateLimits } = this.api.data
      rateLimits[url] = rateLimits[url] || {}
      rateLimits[url].limit = limit
      rateLimits[url].remaining = remaining
      rateLimits[url].reset = reset * 1000
    }
  }

  private getRateLimitRequestUrl(config: AxiosRequestConfig) {
    const url = config.baseURL?.includes?.('graphql')
      ? config.url.substring(config.url.indexOf('/') + 1)
      : config.url
    return url
  }
}

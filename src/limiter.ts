import Bottleneck from 'bottleneck'

export const twitterGuestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })
export const twitterApiLimiter = new Bottleneck({ maxConcurrent: 2 })

export const twitterSpaceApiLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1100,
})

export const discordWebhookLimiter = new Bottleneck({
  reservoir: 5,
  reservoirRefreshAmount: 5,
  reservoirRefreshInterval: 2 * 1000,
})

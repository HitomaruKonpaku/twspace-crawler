import Bottleneck from 'bottleneck'

export const twitterGuestTokenLimiter = new Bottleneck({ maxConcurrent: 1 })
export const twitterApiLimiter = new Bottleneck({ maxConcurrent: 10 })

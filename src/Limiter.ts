import Bottleneck from 'bottleneck'

export const guestTokenRequestLimiter = new Bottleneck({ maxConcurrent: 1 })

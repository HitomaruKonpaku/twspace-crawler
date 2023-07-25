export interface TwitterRateLimit {
  limit?: number
  remaining?: number
  reset?: number
}

export interface TwitterGraphqlEndpoint {
  queryId: string
  operationName: string
}

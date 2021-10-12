export const config = {
  app: {
    mediaDir: '../.media',
    userRefreshInterval: 10000,
    dynamicPlaylistRefreshInterval: 5000,
  },
  logger: {
    dir: './logs',
    datePattern: 'YYMMDD',
  },
  twitter: {
    baseUrl: 'https://twitter.com/',
    baseApiUrl: 'https://twitter.com/i/api/graphql/',
    api: {
      AudioSpaceById: 'jyQ0_DEMZHeoluCgHJ-U5Q/AudioSpaceById',
    },
  },
  tweespaces: {
    api: {
      SpaceByUser: 'https://tweespaces-serverless-function.vercel.app/api/space-by-user',
    },
  },
}

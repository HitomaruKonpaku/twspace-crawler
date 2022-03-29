module.exports = {
  apps: [
    {
      name: 'twspace-crawler',
      namespace: 'crawler',
      script: './dist/index.js',
      args: '--config ./config.json',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}

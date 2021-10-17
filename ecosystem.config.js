module.exports = {
  apps: [
    {
      name: 'twspace-crawler',
      script: './dist/index.js',
      args: '--config ./config.json',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}

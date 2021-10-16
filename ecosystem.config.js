module.exports = {
  apps: [
    {
      name: 'twspace-crawler',
      script: './dist/index.js',
      args: '--user nakiriayame --interval 10000',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}

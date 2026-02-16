module.exports = {
  apps: [
    {
      name: 'decor-bot',
      script: 'decor-bot.js',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}

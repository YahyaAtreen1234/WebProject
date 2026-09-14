/**
 * PM2 process definition for the StonesLand production server.
 *
 * Start:     pm2 start ecosystem.config.js --env production
 * Reload:    pm2 reload stonesland          (zero-downtime)
 * Logs:      pm2 logs stonesland
 * Boot:      pm2 startup && pm2 save
 *
 * `next start` serves the build produced by `npm run build:production`; it does
 * not build anything itself, so deploy order is install -> build -> reload.
 */
module.exports = {
  apps: [
    {
      name: 'stonesland',
      script: 'node_modules/next/dist/bin/next',
      args: 'start --port ' + (process.env.PORT || 3000),
      cwd: __dirname,

      // Next holds its own in-process caches and is not cluster-safe by
      // default, so run a single instance and scale with more app servers
      // rather than more workers on one box.
      instances: 1,
      exec_mode: 'fork',

      autorestart: true,
      watch: false,

      // Restart if the process exceeds this; a leak should recycle rather than
      // take the box down. Raise it if the server has headroom.
      max_memory_restart: '512M',

      // Stop a crash loop from spinning forever.
      min_uptime: '20s',
      max_restarts: 10,
      restart_delay: 2000,

      // Give in-flight requests a chance to finish on reload.
      kill_timeout: 8000,
      listen_timeout: 10000,
      wait_ready: false,

      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },

      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};

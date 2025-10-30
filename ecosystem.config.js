module.exports = {
  apps: [
    {
      name: 'kiongozi-lms',
      cwd: '/root/Kiongozi-LMS',
      script: 'npm',
      args: 'start -- -p 3002',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/.pm2/logs/kiongozi-lms-error.log',
      out_file: '/root/.pm2/logs/kiongozi-lms-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'moderator-dashboard',
      cwd: '/root/Kiongozi-LMS/moderator-dashboard',
      script: 'npm',
      args: 'start -- -p 3001',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/.pm2/logs/moderator-dashboard-error.log',
      out_file: '/root/.pm2/logs/moderator-dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};

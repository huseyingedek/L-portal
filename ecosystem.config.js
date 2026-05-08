module.exports = {
  apps: [
    {
      name:         'lizay-portal',
      script:       './server.js',
      cwd:          '.next/standalone',
      instances:    1,
      exec_mode:    'fork',         
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      kill_timeout:       15000,    
      env: {
        NODE_ENV: 'production',
        PORT:     3100,
      },
    },
  ],
};
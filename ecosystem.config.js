// PM2 konfigürasyonu — sunucuda: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name:         'lizay-portal',
      script:       './server.js',                // standalone build çıktısı
      cwd:          '.next/standalone',           // standalone klasörü
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      kill_timeout:       8000,
      env: {
        NODE_ENV: 'production',
        PORT:     3100,
      },
    },
  ],
};

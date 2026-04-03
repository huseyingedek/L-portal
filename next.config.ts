import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone build — sunucuya deploy için ideal (node_modules dahil minimal paket)
  output: 'standalone',

  // Dış kaynaklı görsellere izin ver (IK, Bilgilendirme sayfalarındaki resimler)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'online.lizaypirlanta.com' },
      { protocol: 'http',  hostname: 'online.lizaypirlanta.com' },
      { protocol: 'https', hostname: 'mobil.lizaypirlanta.com' },
      { protocol: 'http',  hostname: 'mobil.lizaypirlanta.com' },
    ],
  },

  // Güvenlik başlıkları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
        ],
      },
    ];
  },

  // TypeScript hatalarını build'de kontrol et
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;

#!/bin/bash
# ══════════════════════════════════════════════════════
#  Lizay Portal — Deploy Script
#  Sunucuda bir kez çalıştır: bash deploy.sh
# ══════════════════════════════════════════════════════

set -e  # Hata olursa dur

echo "🚀 Lizay Portal Deploy Başlıyor..."

# ── 1. Bağımlılıklar ──────────────────────────────────
echo "📦 Bağımlılıklar yükleniyor..."
npm ci

# ── 2. .env.local hazırla ────────────────────────────
if [ ! -f ".env.local" ]; then
  echo "⚙️  .env.local oluşturuluyor..."
  cp .env.production .env.local
  echo "❗ .env.local oluşturuldu — SESSION_PASSWORD'ü kontrol et!"
fi

# ── 3. Build ─────────────────────────────────────────
echo "🔨 Build alınıyor..."
npm run build

# ── 4. Standalone klasörüne public ve static kopyala ──
echo "📁 Statik dosyalar kopyalanıyor..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# ── 5. PM2 ile başlat/yeniden başlat ─────────────────
echo "⚡ PM2 başlatılıyor..."
if pm2 list | grep -q "lizay-portal"; then
  pm2 reload lizay-portal
  echo "♻️  Uygulama yeniden başlatıldı."
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "✅ Uygulama ilk kez başlatıldı."
fi

echo ""
echo "✅ Deploy tamamlandı!"
echo "   Uygulama: http://localhost:3001"
echo "   Durum:    pm2 status"
echo "   Loglar:   pm2 logs lizay-portal"

#!/bin/bash
# ======================================================
#  Lizay Portal - Deploy Script
#  Sunucuda calistir: bash deploy.sh
# ======================================================

set -e  # Hata olursa dur

echo "Lizay Portal Deploy Basliyor..."

# ── 1. Bagimliliklar ──────────────────────────────────
echo "Bagimliliklar yukleniyor..."
npm ci

# ── 2. .env.local hazirla ────────────────────────────
if [ ! -f ".env.local" ]; then
  echo ".env.local olusturuluyor..."
  cp .env.production .env.local
  echo ".env.local olusturuldu - SESSION_PASSWORD'u kontrol et!"
fi

# ── 3. Build ─────────────────────────────────────────
echo "Build aliniyor..."
npm run build

# ── 4. Standalone klasorune public ve static kopyala ──
echo "Statik dosyalar kopyalaniyor..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# ── 4.1 Eski CANIAS oturum dosyasi kalintisini temizle ─
# Yeni modelde kullanilmiyor; eski deploy'lardan kalmis olabilir.
rm -f .next/standalone/canias_session.txt canias_session.txt

# ── 5. PM2 ile baslat/yeniden baslat ─────────────────
echo "PM2 baslatiliyor..."
if pm2 list | grep -q "lizay-portal"; then
  pm2 reload lizay-portal
  echo "Uygulama yeniden baslatildi."
else
  pm2 start ecosystem.config.js
  pm2 save
  echo "Uygulama ilk kez baslatildi."
fi

echo ""
echo "Deploy tamamlandi!"
echo "   Durum:  pm2 status"
echo "   Loglar: pm2 logs lizay-portal"

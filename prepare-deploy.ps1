# ══════════════════════════════════════════════════════
#  Lizay Portal — FTP Deploy Paketi Hazırlama (Windows)
#  Powershell'de çalıştır: .\prepare-deploy.ps1
# ══════════════════════════════════════════════════════

Write-Host "🔨 Build alınıyor..." -ForegroundColor Cyan
npm run build

Write-Host "📁 Statik dosyalar kopyalanıyor..." -ForegroundColor Cyan

# public klasörünü standalone'a kopyala
if (Test-Path ".next\standalone\public") {
    Remove-Item ".next\standalone\public" -Recurse -Force
}
Copy-Item "public" -Destination ".next\standalone\public" -Recurse

# .next/static klasörünü standalone/.next/static'e kopyala
if (Test-Path ".next\standalone\.next\static") {
    Remove-Item ".next\standalone\.next\static" -Recurse -Force
}
Copy-Item ".next\static" -Destination ".next\standalone\.next\static" -Recurse

# .env.production dosyasını .env.local olarak standalone'a kopyala
Copy-Item ".env.production" -Destination ".next\standalone\.env.local"

# ecosystem.config.js kopyala (PM2 için)
Copy-Item "ecosystem.config.js" -Destination ".next\standalone\ecosystem.config.js"

Write-Host ""
Write-Host "✅ Hazır! FTP ile şu klasörü yükle:" -ForegroundColor Green
Write-Host "   📂 .next\standalone\" -ForegroundColor Yellow
Write-Host ""
Write-Host "Sunucuda bu klasörün içinde:" -ForegroundColor Cyan
Write-Host "   node server.js          # Test için"
Write-Host "   pm2 start ecosystem.config.js  # Production için"
Write-Host ""
Write-Host "⚠️  Sunucuya yükledikten sonra .env.local içindeki" -ForegroundColor Red
Write-Host "   SESSION_PASSWORD'ü güçlü bir şifreyle değiştir!" -ForegroundColor Red

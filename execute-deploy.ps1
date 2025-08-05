# EXECUTAR DEPLOY AUTOMÁTICO NA VPS
# Script PowerShell para executar todos os blocos do DEPLOY-FINAL.md

Write-Host "=== EXECUTANDO DEPLOY NA VPS ===" -ForegroundColor Green
Write-Host "VPS: 147.93.32.222" -ForegroundColor Yellow
Write-Host "Repositório: https://github.com/vitorduarteebb/tecido.git" -ForegroundColor Yellow
Write-Host ""

# BLOCO 1: Backup e Preparação
Write-Host "BLOCO 1: Backup e Preparação..." -ForegroundColor Cyan
$bloco1 = @"
mkdir -p /root/backups
pm2 stop all
if [ -d "/root/tecidos-app" ]; then
    cd /root/tecidos-app
    tar -czf /root/backups/backup-`$(date +%Y%m%d-%H%M%S).tar.gz .
    cd /root
    mv tecidos-app tecidos-app-backup-`$(date +%Y%m%d-%H%M%S)
fi
echo "✅ BLOCO 1 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco1

# BLOCO 2: Clonar do GitHub
Write-Host "BLOCO 2: Clonar do GitHub..." -ForegroundColor Cyan
$bloco2 = @"
cd /root
git clone https://github.com/vitorduarteebb/tecido.git tecidos-app
cd tecidos-app
echo "✅ BLOCO 2 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco2

# BLOCO 3: Instalar Backend
Write-Host "BLOCO 3: Instalar Backend..." -ForegroundColor Cyan
$bloco3 = @"
cd /root/tecidos-app/backend
npm install
npm run build
echo "✅ BLOCO 3 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco3

# BLOCO 4: Instalar Frontend
Write-Host "BLOCO 4: Instalar Frontend..." -ForegroundColor Cyan
$bloco4 = @"
cd /root/tecidos-app
npm install
npm run build
echo "✅ BLOCO 4 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco4

# BLOCO 5: Configurar PM2
Write-Host "BLOCO 5: Configurar PM2..." -ForegroundColor Cyan
$bloco5 = @"
cd /root/tecidos-app
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'tecidos-backend',
      script: './backend/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'tecidos-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
EOF
echo "✅ BLOCO 5 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco5

# BLOCO 6: Instalar Serve e Iniciar
Write-Host "BLOCO 6: Instalar Serve e Iniciar..." -ForegroundColor Cyan
$bloco6 = @"
npm install -g serve
cd /root/tecidos-app
pm2 start ecosystem.config.js
pm2 save
echo "✅ BLOCO 6 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco6

# BLOCO 7: Criar Script de Deploy Automático
Write-Host "BLOCO 7: Criar Script de Deploy Automático..." -ForegroundColor Cyan
$bloco7 = @"
cat > /root/auto-deploy.sh << 'EOF'
#!/bin/bash
echo "=== DEPLOY AUTOMÁTICO ==="
cd /root/tecidos-app
cp backend/database.sqlite /root/backups/database-`$(date +%Y%m%d-%H%M%S).sqlite
pm2 stop all
git pull origin main
cd backend && npm install && npm run build
cd .. && npm install && npm run build
pm2 start ecosystem.config.js
pm2 save
echo "=== DEPLOY CONCLUÍDO ==="
EOF
chmod +x /root/auto-deploy.sh
echo "✅ BLOCO 7 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco7

# BLOCO 8: Verificar Status
Write-Host "BLOCO 8: Verificar Status..." -ForegroundColor Cyan
$bloco8 = @"
pm2 status
echo ""
echo "=== LOGS RECENTES ==="
pm2 logs --lines 5
echo "✅ BLOCO 8 CONCLUÍDO"
"@

ssh root@147.93.32.222 $bloco8

Write-Host ""
Write-Host "🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "✅ Frontend: http://147.93.32.222:3000" -ForegroundColor Yellow
Write-Host "✅ Backend: http://147.93.32.222:5000" -ForegroundColor Yellow
Write-Host "✅ Script de deploy: /root/auto-deploy.sh" -ForegroundColor Yellow
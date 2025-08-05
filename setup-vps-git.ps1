# CONFIGURAÇÃO VPS - DEPLOY AUTOMÁTICO DO GITHUB
# PowerShell Script para Windows

Write-Host "=== CONFIGURAÇÃO VPS - DEPLOY AUTOMÁTICO DO GITHUB ===" -ForegroundColor Green
Write-Host "VPS: 147.93.32.222" -ForegroundColor Yellow
Write-Host "Repositório: https://github.com/vitorduarteebb/tecido.git" -ForegroundColor Yellow
Write-Host ""

# Executar comandos na VPS via SSH
$setupCommands = @"
echo "=== CONFIGURANDO VPS PARA DEPLOY AUTOMÁTICO ==="

# 1. Criar backup antes de começar
echo "1. Criando backup..."
mkdir -p /root/backups
if [ -d "/root/tecidos-app" ]; then
    cd /root/tecidos-app
    tar -czf /root/backups/backup-before-git-`$(date +%Y%m%d-%H%M%S).tar.gz .
    echo "✅ Backup criado"
fi

# 2. Parar serviços
echo "2. Parando serviços..."
pm2 stop all 2>/dev/null || echo "PM2 não estava rodando"

# 3. Preparar diretório
echo "3. Preparando diretório..."
if [ -d "/root/tecidos-app" ]; then
    echo "Diretório existe - fazendo backup e removendo"
    mv /root/tecidos-app /root/tecidos-app-backup-`$(date +%Y%m%d-%H%M%S)
fi

# 4. Clonar repositório do GitHub
echo "4. Clonando repositório do GitHub..."
cd /root
git clone https://github.com/vitorduarteebb/tecido.git tecidos-app
cd tecidos-app

# 5. Instalar dependências do backend
echo "5. Instalando dependências do backend..."
cd backend
npm install
npm run build

# 6. Instalar dependências do frontend
echo "6. Instalando dependências do frontend..."
cd ..
npm install
npm run build

# 7. Criar script de deploy automático
echo "7. Criando script de deploy automático..."
cat > /root/auto-deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
echo "=== DEPLOY AUTOMÁTICO INICIADO ==="
echo "Data: `$(date)"

cd /root/tecidos-app

# Backup do banco antes do deploy
cp backend/database.sqlite /root/backups/database-auto-`$(date +%Y%m%d-%H%M%S).sqlite 2>/dev/null || echo "Banco não encontrado"

# Parar serviços
pm2 stop all 2>/dev/null

# Fazer pull das mudanças
git pull origin main

# Instalar dependências e compilar backend
cd backend
npm install
npm run build

# Instalar dependências e compilar frontend
cd ..
npm install
npm run build

# Reiniciar serviços
pm2 start ecosystem.config.js
pm2 save

echo "=== DEPLOY AUTOMÁTICO CONCLUÍDO ==="
echo "Data: `$(date)"
DEPLOY_SCRIPT

chmod +x /root/auto-deploy.sh

# 8. Criar configuração do PM2
echo "8. Criando configuração do PM2..."
cat > ecosystem.config.js << 'PM2_CONFIG'
module.exports = {
  apps: [
    {
      name: 'tecidos-backend',
      script: './backend/dist/index.js',
      cwd: '/root/tecidos-app',
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
      cwd: '/root/tecidos-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
PM2_CONFIG

# 9. Instalar serve globalmente
echo "9. Instalando serve..."
npm install -g serve

# 10. Iniciar serviços
echo "10. Iniciando serviços..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "=== RESUMO ==="
echo "✅ Repositório clonado: /root/tecidos-app"
echo "✅ Dependências instaladas"
echo "✅ Aplicação compilada"
echo "✅ PM2 configurado"
echo "✅ Script de deploy criado: /root/auto-deploy.sh"
echo ""
echo "=== COMANDOS ÚTEIS ==="
echo "Deploy manual: /root/auto-deploy.sh"
echo "Status PM2: pm2 status"
echo "Logs PM2: pm2 logs"
echo "Reiniciar: pm2 restart all"
"@

Write-Host "Executando configuração na VPS..." -ForegroundColor Yellow
ssh root@147.93.32.222 $setupCommands

Write-Host ""
Write-Host "✅ CONFIGURAÇÃO DA VPS CONCLUÍDA!" -ForegroundColor Green
Write-Host "A VPS agora está configurada para deploy automático do GitHub" -ForegroundColor Green
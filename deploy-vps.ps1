# DEPLOY VPS - SISTEMA DE TECIDOS
# PowerShell Script para Windows

Write-Host "=== DEPLOY VPS - SISTEMA DE TECIDOS ===" -ForegroundColor Green
Write-Host "VPS: 147.93.32.222" -ForegroundColor Yellow
Write-Host "Data: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

# Configurações
$VPS_IP = "147.93.32.222"
$VPS_USER = "root"
$PROJECT_DIR = "/root/tecidos-app"

# Função para log colorido
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# 1. Backup do sistema atual
Write-Info "1. Criando backup do sistema atual..."
$backupCmd = @"
mkdir -p /root/backups
cd /root/tecidos-app
tar -czf /root/backups/backup-`$(date +%Y%m%d-%H%M%S).tar.gz .
cp backend/database.sqlite /root/backups/database-`$(date +%Y%m%d-%H%M%S).sqlite
echo "Backup criado com sucesso!"
"@

ssh $VPS_USER@$VPS_IP $backupCmd

# 2. Atualizar sistema operacional
Write-Info "2. Atualizando sistema operacional..."
ssh $VPS_USER@$VPS_IP "apt update && apt upgrade -y"

# 3. Parar serviços
Write-Info "3. Parando serviços atuais..."
ssh $VPS_USER@$VPS_IP "cd /root/tecidos-app && pm2 stop all"

# 4. Atualizar código do backend
Write-Info "4. Atualizando código do backend..."
scp -r backend/src/* $VPS_USER@$VPS_IP:/root/tecidos-app/backend/src/
scp backend/package.json $VPS_USER@$VPS_IP:/root/tecidos-app/backend/
scp backend/tsconfig.json $VPS_USER@$VPS_IP:/root/tecidos-app/backend/

# 5. Instalar dependências e compilar backend
Write-Info "5. Instalando dependências e compilando backend..."
ssh $VPS_USER@$VPS_IP "cd /root/tecidos-app/backend && npm install && npm run build"

# 6. Atualizar código do frontend
Write-Info "6. Atualizando código do frontend..."
scp -r src/* $VPS_USER@$VPS_IP:/root/tecidos-app/src/
scp package.json $VPS_USER@$VPS_IP:/root/tecidos-app/
scp vite.config.ts $VPS_USER@$VPS_IP:/root/tecidos-app/
scp tailwind.config.js $VPS_USER@$VPS_IP:/root/tecidos-app/
scp tsconfig.json $VPS_USER@$VPS_IP:/root/tecidos-app/

# 7. Instalar dependências e compilar frontend
Write-Info "7. Instalando dependências e compilando frontend..."
ssh $VPS_USER@$VPS_IP "cd /root/tecidos-app && npm install && npm run build"

# 8. Reiniciar serviços
Write-Info "8. Reiniciando serviços..."
ssh $VPS_USER@$VPS_IP "cd /root/tecidos-app && pm2 start ecosystem.config.js && pm2 save"

# 9. Verificar status
Write-Info "9. Verificando status dos serviços..."
ssh $VPS_USER@$VPS_IP "pm2 status"
ssh $VPS_USER@$VPS_IP "pm2 logs --lines 10"

Write-Info "=== DEPLOY CONCLUÍDO COM SUCESSO! ==="
Write-Info "Sistema atualizado na VPS: $VPS_IP"
Write-Info "Backups salvos em: /root/backups/"
Write-Info "Data: $(Get-Date)" 
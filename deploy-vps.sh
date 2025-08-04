#!/bin/bash

echo "=== DEPLOY VPS - SISTEMA DE TECIDOS ==="
echo "VPS: 147.93.32.222"
echo "Data: $(date)"
echo ""

# Configurações
VPS_IP="147.93.32.222"
VPS_USER="root"
PROJECT_DIR="/root/tecidos-app"
BACKUP_DIR="/root/backups"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Backup do sistema atual
log_info "1. Criando backup do sistema atual..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    mkdir -p /root/backups
    cd /root/tecidos-app
    tar -czf /root/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz .
    echo "Backup criado com sucesso!"
EOF

# 2. Atualizar sistema operacional
log_info "2. Atualizando sistema operacional..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    apt update && apt upgrade -y
    echo "Sistema atualizado!"
EOF

# 3. Parar serviços atuais
log_info "3. Parando serviços atuais..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    cd /root/tecidos-app
    pm2 stop all 2>/dev/null || echo "PM2 não estava rodando"
    echo "Serviços parados!"
EOF

# 4. Fazer backup do banco de dados
log_info "4. Fazendo backup do banco de dados..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    cd /root/tecidos-app/backend
    cp database.sqlite /root/backups/database-$(date +%Y%m%d-%H%M%S).sqlite
    echo "Backup do banco criado!"
EOF

# 5. Atualizar código do backend
log_info "5. Atualizando código do backend..."
scp -r backend/src/* $VPS_USER@$VPS_IP:/root/tecidos-app/backend/src/
scp backend/package.json $VPS_USER@$VPS_IP:/root/tecidos-app/backend/
scp backend/tsconfig.json $VPS_USER@$VPS_IP:/root/tecidos-app/backend/

# 6. Instalar dependências e compilar backend
log_info "6. Instalando dependências e compilando backend..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    cd /root/tecidos-app/backend
    npm install
    npm run build
    echo "Backend compilado com sucesso!"
EOF

# 7. Atualizar código do frontend
log_info "7. Atualizando código do frontend..."
scp -r src/* $VPS_USER@$VPS_IP:/root/tecidos-app/src/
scp package.json $VPS_USER@$VPS_IP:/root/tecidos-app/
scp vite.config.ts $VPS_USER@$VPS_IP:/root/tecidos-app/
scp tailwind.config.js $VPS_USER@$VPS_IP:/root/tecidos-app/
scp tsconfig.json $VPS_USER@$VPS_IP:/root/tecidos-app/

# 8. Instalar dependências e compilar frontend
log_info "8. Instalando dependências e compilando frontend..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    cd /root/tecidos-app
    npm install
    npm run build
    echo "Frontend compilado com sucesso!"
EOF

# 9. Reiniciar serviços
log_info "9. Reiniciando serviços..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    cd /root/tecidos-app
    pm2 start ecosystem.config.js
    pm2 save
    echo "Serviços reiniciados!"
EOF

# 10. Verificar status
log_info "10. Verificando status dos serviços..."
ssh $VPS_USER@$VPS_IP << 'EOF'
    pm2 status
    echo ""
    echo "=== LOGS RECENTES ==="
    pm2 logs --lines 10
EOF

log_info "=== DEPLOY CONCLUÍDO COM SUCESSO! ==="
log_info "Sistema atualizado na VPS: $VPS_IP"
log_info "Backups salvos em: /root/backups/"
log_info "Data: $(date)" 
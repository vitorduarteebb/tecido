#!/bin/bash

# Script de deploy para o sistema Tecidos-app
# VPS Ubuntu 24.04 LTS
# Autor: vitorduarteebb

set -e

echo "==== ATUALIZANDO SISTEMA TECIDOS ===="

# Parar o backend atual
echo "Parando backend atual..."
pm2 stop tecidos-backend || true

# Fazer backup da pasta atual
echo "Fazendo backup..."
cd /root
mv tecidos-app tecidos-app-backup-$(date +%Y%m%d%H%M%S) 2>/dev/null || true

# Clonar/atualizar repositório
echo "Clonando repositório..."
git clone https://github.com/vitorduarteebb/tecido tecidos-app
cd tecidos-app

# Configurar variáveis de ambiente
echo "Configurando variáveis de ambiente..."
cat <<EOF > backend/.env
MONGODB_URI=mongodb://localhost:27017/tecidos
JWT_SECRET=$(openssl rand -hex 32)
PORT=3001
EOF

cat <<EOF > .env
VITE_API_URL=http://147.93.32.222/api
EOF

# Build do backend
echo "Build do backend..."
cd backend
npm install
npm run build

# Build do frontend (forçado, ignorando erros TypeScript)
echo "Build do frontend..."
cd ..
npm install
npm run build:force

# Reiniciar backend
echo "Reiniciando backend..."
cd backend
pm2 start dist/index.js --name tecidos-backend || pm2 restart tecidos-backend

echo "==== DEPLOY CONCLUÍDO ===="
echo "Backend rodando na porta 3001"
echo "Frontend buildado em /root/tecidos-app/dist"
echo "Acesse: http://147.93.32.222" 
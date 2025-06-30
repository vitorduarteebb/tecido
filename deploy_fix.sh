#!/bin/bash

# Script para corrigir o layout antigo na VPS
echo "🔧 Corrigindo layout na VPS..."

# 1. Atualizar código
cd /opt/tecidos-app
git pull origin main

# 2. Limpar cache e node_modules
rm -rf node_modules
rm -rf dist
npm install

# 3. Fazer build do frontend
echo "📦 Fazendo build do frontend..."
npm run build

# 4. Atualizar backend
cd backend
rm -rf node_modules
npm install
npm run build

# 5. Reiniciar serviços
pm2 restart tecidos-backend
systemctl reload nginx

# 6. Limpar cache do navegador (instrução para o usuário)
echo "🧹 Limpe o cache do seu navegador (Ctrl+F5 ou Ctrl+Shift+R)"

echo "✅ Deploy concluído!" 
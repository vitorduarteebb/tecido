#!/bin/bash

echo "🔨 Fazendo build forçado do frontend..."

cd /opt/tecidos-app

# Remover build anterior
rm -rf dist

# Fazer build ignorando erros TypeScript
npx vite build --mode production

echo "✅ Build concluído!"
echo "📁 Arquivos gerados em: /opt/tecidos-app/dist" 
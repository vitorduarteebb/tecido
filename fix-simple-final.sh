#!/bin/bash

echo "=== CORREÇÃO SIMPLES E FINAL ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

# Aplicar apenas a correção mais importante
echo "Aplicando correção essencial..."

# Corrigir apenas o acesso que está causando o erro
sed -i 's/(pedido\.itens || \[\]).map/(pedido?.itens || []).map/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== CORREÇÃO SIMPLES APLICADA! Teste novamente. ===" 
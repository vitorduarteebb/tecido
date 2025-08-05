#!/bin/bash

echo "=== Aplicando correção simples ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

# Aplicar apenas correções essenciais
echo "Aplicando correções essenciais..."

# Corrigir linha 111 - pedidoId
sed -i 's/const pedidoId = (pedido\.id || pedido\._id) ?? '\'\'';/const pedidoId = (pedido?.id || pedido?._id) ?? '\'\'';/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança básicas
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correção simples aplicada! Teste novamente. ===" 
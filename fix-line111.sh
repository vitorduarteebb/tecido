#!/bin/bash

echo "=== Corrigindo linha 111 ==="

cd /opt/tecidos-app

# Corrigir especificamente a linha 111
sed -i '111s/const pedidoId = (pedido?.id || pedido??.id) ?? '\'\'';/const pedidoId = (pedido?.id || '\'\'') ?? '\'\'';/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Linha 111 corrigida! Teste novamente. ===" 
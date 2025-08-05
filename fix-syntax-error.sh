#!/bin/bash

echo "=== Corrigindo erro de sintaxe ==="

cd /opt/tecidos-app

# Corrigir a linha com erro de sintaxe
sed -i 's/pedido\.cliente\.razaoSocial || pedido\.cliente?.nome || ""Fantasia || pedido\.cliente?.nome || "" || '\''Sem nome'\''/pedido.cliente?.razaoSocial || pedido.cliente?.nomeFantasia || pedido.cliente?.nome || '\''Sem nome'\''/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando com a correção..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Erro de sintaxe corrigido! Teste novamente. ===" 
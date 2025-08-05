#!/bin/bash

echo "=== Corrigindo todas as linhas problemáticas ==="

cd /opt/tecidos-app

# Corrigir todas as linhas com pedido??.id
sed -i 's/pedido??\.id/'\'\''/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Todas as linhas corrigidas! Teste novamente. ===" 
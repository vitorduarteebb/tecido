#!/bin/bash

echo "=== Corrigindo linha 33 ==="

cd /opt/tecidos-app

# Corrigir especificamente a linha 33
sed -i '33s/historicoAlteracoes?: any\[\] || \[\];/historicoAlteracoes?: any\[\];/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Linha 33 corrigida! Teste novamente. ===" 
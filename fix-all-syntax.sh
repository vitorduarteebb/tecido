#!/bin/bash

echo "=== Corrigindo todos os erros de sintaxe ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

# Aplicar apenas correções essenciais sem quebrar a sintaxe
echo "Aplicando correções essenciais..."

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos a id de forma segura
sed -i 's/pedido\.id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\._id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correções de sintaxe aplicadas! Teste novamente. ===" 
#!/bin/bash

echo "=== CORREÇÃO AGESSIVA PARA _id ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

echo "Aplicando correções AGESSIVAS para _id..."

# Corrigir TODOS os acessos a _id de forma agressiva
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/produtoObj\._id/produtoObj?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/item\.produto\._id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\._id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\._id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\._id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em arrays
sed -i 's/produtos\.find\(p => p\._id/produtos?.find(p => p?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find\(p => p\.id/produtos?.find(p => p?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em map functions
sed -i 's/\.map\(item => item\._id\)/?.map(item => item?.id)/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\.map\(produto => produto\._id\)/?.map(produto => produto?.id)/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== CORREÇÃO AGESSIVA APLICADA! Teste novamente. ===" 
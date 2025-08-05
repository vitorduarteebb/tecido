#!/bin/bash

echo "=== CORREÇÃO ULTIMATE PARA _id ==="

cd /opt/tecidos-app

# Fazer backup
cp src/pages/admin/DetalhesPedido.tsx src/pages/admin/DetalhesPedido.tsx.backup5

echo "Aplicando correções ULTIMATE para _id..."

# Corrigir TODOS os acessos a _id de forma agressiva
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/item\._id/item?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produto\._id/produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\._id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/cliente\._id/cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/representante\._id/representante?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em arrays
sed -i 's/\.map\(item => item\._id\)/?.map(item => item?.id)/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\.map\(produto => produto\._id\)/?.map(produto => produto?.id)/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em objetos aninhados
sed -i 's/item\.produto\._id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\._id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\._id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== CORREÇÃO ULTIMATE APLICADA! Teste novamente. ===" 
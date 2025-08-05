#!/bin/bash

echo "=== Corrigindo TODOS os acessos a _id ==="

cd /opt/tecidos-app

# Fazer backup
cp src/pages/admin/DetalhesPedido.tsx src/pages/admin/DetalhesPedido.tsx.backup3

echo "Aplicando correções agressivas para _id..."

# Corrigir TODOS os acessos a _id de forma mais agressiva
sed -i 's/\._id || \.id/?.id || ""/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/produtoSelecionado\._id/produtoSelecionado?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/item\.produto\._id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtoObj\._id/produtoObj?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\._id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\._id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\._id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em arrays
sed -i 's/produtos\.find\(p => p\._id/produtos?.find(p => p?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find\(p => p\.id/produtos?.find(p => p?.id/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para todos os objetos
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente/pedido?.cliente/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante/pedido?.representante/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em map functions
sed -i 's/\.map\(/?.map(/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando com as correções agressivas..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Todas as correções agressivas aplicadas! Teste novamente. ===" 
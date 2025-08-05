#!/bin/bash

echo "=== CORREÇÃO FINAL ULTIMATE ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

echo "Aplicando correções FINAIS..."

# Corrigir TODOS os acessos a .id e ._id de forma agressiva
sed -i 's/\.id/?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/produtoObj\.id/produtoObj?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtoObj\._id/produtoObj?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/item\.produto\.id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/item\.produto\._id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\.id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\._id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\.id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\._id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\._id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em arrays e objetos
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente/pedido?.cliente/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante/pedido?.representante/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em map functions
sed -i 's/\.map\(/?.map(/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/\[\]/\[\] || \[\]/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== CORREÇÃO FINAL APLICADA! Teste novamente. ===" 
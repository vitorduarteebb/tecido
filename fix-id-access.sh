#!/bin/bash

echo "=== Corrigindo acessos a 'id' undefined ==="

cd /opt/tecidos-app

# Fazer backup
cp src/pages/admin/DetalhesPedido.tsx src/pages/admin/DetalhesPedido.tsx.backup4

echo "Aplicando verificações de segurança para 'id'..."

# Corrigir todos os acessos a .id que podem ser undefined
sed -i 's/\.id || \.id/?.id || ""/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/\.id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos específicos que podem estar causando problemas
sed -i 's/produtoSelecionado\.id/produtoSelecionado?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/item\.produto\.id/item.produto?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtoObj\.id/produtoObj?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\.id/pedido.cliente?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante\.id/pedido.representante?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.id/pedido?.id/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em arrays e objetos
sed -i 's/produtos\.find\(p => p\.id/produtos?.find(p => p?.id/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente/pedido?.cliente/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.representante/pedido?.representante/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/\.map\(/?.map(/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acessos em objetos aninhados
sed -i 's/(pedido\.cliente as any)\./(pedido?.cliente as any)?./g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando com as correções..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correções para 'id' aplicadas! Teste novamente. ===" 
#!/bin/bash

echo "=== Corrigindo erro específico em DetalhesPedido.tsx ==="

cd /opt/tecidos-app

# Fazer backup do arquivo original
cp src/pages/admin/DetalhesPedido.tsx src/pages/admin/DetalhesPedido.tsx.backup

# Corrigir todas as referências a _id que podem ser undefined
echo "Aplicando correções de segurança para _id..."

# Corrigir acesso a produtoSelecionado._id
sed -i 's/produtoSelecionado\._id || produtoSelecionado\.id/produtoSelecionado?._id || produtoSelecionado?.id || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a item.produto._id
sed -i 's/item\.produto\._id || item\.produto\.id/item.produto?._id || item.produto?.id || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a produtoObj._id
sed -i 's/produtoObj\._id || produtoObj\.id/produtoObj?._id || produtoObj?.id || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a pedido.cliente._id
sed -i 's/pedido\.cliente\._id || pedido\.cliente\.id/pedido.cliente?._id || pedido.cliente?.id || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a pedido.representante._id
sed -i 's/pedido\.representante\._id || pedido\.representante\.id/pedido.representante?._id || pedido.representante?.id || ""/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/(pedido\.itens || \[\]).map/(pedido?.itens || []).map/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a produtos.find
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando com as correções..."
npm run build

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correções aplicadas! Teste novamente a página de detalhes do pedido. ===" 
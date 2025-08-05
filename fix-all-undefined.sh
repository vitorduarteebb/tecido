#!/bin/bash

echo "=== Corrigindo todos os acessos a propriedades undefined ==="

cd /opt/tecidos-app

# Fazer backup
cp src/pages/admin/DetalhesPedido.tsx src/pages/admin/DetalhesPedido.tsx.backup2

echo "Aplicando verificações de segurança para todas as propriedades..."

# Corrigir acesso a produto.nome
sed -i 's/produto\.nome/produto?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a produtoObj.nome
sed -i 's/produtoObj\.nome/produtoObj?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a item.produto.nome
sed -i 's/item\.produto\.nome/item.produto?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a pedido.cliente.nome
sed -i 's/pedido\.cliente\.nome/pedido.cliente?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a pedido.representante.nome
sed -i 's/pedido\.representante\.nome/pedido.representante?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a produtoSelecionado.nome
sed -i 's/produtoSelecionado\.nome/produtoSelecionado?.nome || ""/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para arrays
sed -i 's/\.map(/?.map(/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a produtos.find
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

# Corrigir acesso a pedido.itens
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança para objetos aninhados
sed -i 's/(pedido\.cliente as any)\.endereco/(pedido?.cliente as any)?.endereco/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/(pedido\.cliente as any)\.telefone/(pedido?.cliente as any)?.telefone/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/(pedido\.cliente as any)\.celular/(pedido?.cliente as any)?.celular/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando com as correções..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Todas as correções aplicadas! Teste novamente. ===" 
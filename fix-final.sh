#!/bin/bash

echo "=== Aplicando correção final ==="

cd /opt/tecidos-app

# Restaurar backup limpo
cp src/pages/admin/DetalhesPedido.tsx.backup src/pages/admin/DetalhesPedido.tsx

# Aplicar apenas as correções essenciais
echo "Aplicando correções essenciais..."

# Corrigir acessos a _id de forma simples
sed -i 's/\._id/?.id/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de segurança básicas
sed -i 's/pedido\.itens/pedido?.itens/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/produtos\.find/produtos?.find/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando..."
npx vite build --mode production

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correção final aplicada! Teste novamente. ===" 
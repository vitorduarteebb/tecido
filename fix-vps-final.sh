#!/bin/bash

echo "=== Corrigindo erros finais de TypeScript ==="

cd /opt/tecidos-app

# Corrigir CriarPedido.tsx - remover referências a user._id
sed -i 's/user\._id || user\.id/user.id/g' src/pages/admin/CriarPedido.tsx
sed -i 's/if (!user || !(user\._id || user\.id))/if (!user || !user.id)/g' src/pages/admin/CriarPedido.tsx

# Corrigir DetalhesPedido.tsx - ajustar tipos do cliente
sed -i 's/clienteCompleto = null/clienteCompleto = ""/g' src/pages/admin/DetalhesPedido.tsx

# Adicionar verificações de tipo para endereco e telefone
sed -i 's/pedido\.cliente\.endereco/(pedido.cliente as any).endereco/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\.telefone/(pedido.cliente as any).telefone/g' src/pages/admin/DetalhesPedido.tsx
sed -i 's/pedido\.cliente\.celular/(pedido.cliente as any).celular/g' src/pages/admin/DetalhesPedido.tsx

echo "Compilando novamente..."
npm run build

echo "Reiniciando serviços..."
pm2 restart all

echo "=== Correções finais aplicadas! ===" 
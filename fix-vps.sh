#!/bin/bash

echo "=== Aplicando correções na VPS ==="

# Navegar para o diretório do projeto
cd /opt/tecidos-app

echo "1. Removendo importações não utilizadas..."

# Corrigir MobileNavigation.tsx
sed -i 's/Group as GroupIcon,//g' src/components/MobileNavigation.tsx
sed -i 's/AddShoppingCart,//g' src/components/MobileNavigation.tsx
sed -i 's/AttachMoney,//g' src/components/MobileNavigation.tsx
sed -i 's/const handleChange = (event: React.SyntheticEvent, newValue: number) => {/const handleChange = (_: React.SyntheticEvent, newValue: number) => {/g' src/components/MobileNavigation.tsx
sed -i 's/navigationItems.map((item, index) => (/navigationItems.map((item) => (/g' src/components/MobileNavigation.tsx

# Corrigir CadastroCliente.tsx
sed -i '/const condicoesPagamento = \[/,/];/d' src/pages/admin/CadastroCliente.tsx

# Corrigir CriarPedido.tsx
sed -i 's/Chip,//g' src/pages/admin/CriarPedido.tsx

# Corrigir Dashboard.tsx
sed -i 's/Paper,//g' src/pages/admin/Dashboard.tsx
sed -i 's/Person as PersonIcon,//g' src/pages/admin/Dashboard.tsx

# Corrigir DetalhesPedido.tsx
sed -i '/import { Cliente } from/d' src/pages/admin/DetalhesPedido.tsx

# Corrigir ListaPedidos.tsx
sed -i 's/onChange={(e, newValue) => setTabValue(newValue)}/onChange={(_, newValue) => setTabValue(newValue)}/g' src/pages/admin/ListaPedidos.tsx

# Corrigir Login.tsx
sed -i 's/Card,//g' src/pages/Login.tsx

# Limpar script resetRepresentantePassword.ts
echo "" > src/scripts/resetRepresentantePassword.ts

echo "2. Instalando dependências..."
npm install

echo "3. Compilando o projeto..."
npm run build

echo "4. Reiniciando serviços..."
pm2 restart all

echo "=== Correções aplicadas com sucesso! ===" 
#!/bin/bash

echo "=== Executando importação de clientes ==="
cd backend
npm run import-clientes

echo ""
echo "=== Executando importação de produtos ==="
npm run import-produtos

echo ""
echo "=== Importações concluídas ===" 
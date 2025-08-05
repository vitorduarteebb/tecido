#!/bin/bash

echo "=== Instalando dependências do backend ==="
cd backend
npm install

echo "=== Fazendo build do backend ==="
npm run build

echo "=== Build concluído ===" 
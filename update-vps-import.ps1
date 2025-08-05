Write-Host "=== Atualizando VPS com funcionalidades de importação ===" -ForegroundColor Green

# Nome do servidor VPS
$VPS_HOST = "root@45.79.124.13"

Write-Host "1. Enviando arquivos para a VPS..." -ForegroundColor Yellow
scp -r backend/src/scripts/importClientes.ts ${VPS_HOST}:/root/tecidos-app/backend/src/scripts/
scp -r backend/src/scripts/importProdutos.ts ${VPS_HOST}:/root/tecidos-app/backend/src/scripts/
scp -r backend/src/controllers/importController.ts ${VPS_HOST}:/root/tecidos-app/backend/src/controllers/
scp -r backend/src/routes/importRoutes.ts ${VPS_HOST}:/root/tecidos-app/backend/src/routes/
scp -r backend/src/routes/index.ts ${VPS_HOST}:/root/tecidos-app/backend/src/routes/
scp -r backend/package.json ${VPS_HOST}:/root/tecidos-app/backend/
scp -r "Clientes exemplo.xls" ${VPS_HOST}:/root/tecidos-app/
scp -r "produtos exemplo.xlsx" ${VPS_HOST}:/root/tecidos-app/

Write-Host "2. Conectando à VPS para instalar dependências e fazer build..." -ForegroundColor Yellow
ssh ${VPS_HOST} @"
cd /root/tecidos-app/backend
echo "Instalando dependência xlsx..."
npm install xlsx
echo "Fazendo build..."
npm run build
echo "Reiniciando serviços..."
systemctl restart tecidos-backend
systemctl restart tecidos-frontend
echo "Verificando status dos serviços..."
systemctl status tecidos-backend --no-pager
systemctl status tecidos-frontend --no-pager
"@

Write-Host "3. Executando importações..." -ForegroundColor Yellow
ssh ${VPS_HOST} @"
cd /root/tecidos-app/backend
echo "Importando clientes..."
npm run import-clientes
echo ""
echo "Importando produtos..."
npm run import-produtos
"@

Write-Host "=== Atualização da VPS concluída ===" -ForegroundColor Green 
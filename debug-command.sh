#!/bin/bash

echo "🔍 INICIANDO DEBUG AVANÇADO DO SISTEMA TECIDOS"
echo "=============================================="

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 1. Verificar status do sistema
log "1. Verificando status do sistema..."
pm2 status
echo ""

# 2. Verificar logs do PM2
log "2. Verificando logs do PM2..."
pm2 logs --lines 20
echo ""

# 3. Verificar espaço em disco
log "3. Verificando espaço em disco..."
df -h
echo ""

# 4. Verificar memória
log "4. Verificando uso de memória..."
free -h
echo ""

# 5. Verificar processos
log "5. Verificando processos..."
ps aux | grep -E "(node|npm|vite)" | head -10
echo ""

# 6. Verificar arquivos do projeto
log "6. Verificando estrutura do projeto..."
cd /root/tecidos-app
ls -la
echo ""

# 7. Verificar dependências
log "7. Verificando dependências..."
echo "Frontend dependencies:"
npm list --depth=0 | head -20
echo ""
echo "Backend dependencies:"
cd backend && npm list --depth=0 | head -20
cd ..
echo ""

# 8. Verificar build
log "8. Verificando arquivos de build..."
ls -la dist/
echo ""

# 9. Verificar logs do nginx (se existir)
log "9. Verificando logs do nginx..."
if [ -f /var/log/nginx/error.log ]; then
    tail -10 /var/log/nginx/error.log
else
    echo "Nginx não encontrado ou logs não disponíveis"
fi
echo ""

# 10. Verificar variáveis de ambiente
log "10. Verificando variáveis de ambiente..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo ""

# 11. Testar conectividade
log "11. Testando conectividade..."
curl -I http://localhost:3001/api/health 2>/dev/null || echo "Backend não responde"
echo ""

# 12. Verificar arquivos de configuração
log "12. Verificando arquivos de configuração..."
echo "Vite config:"
cat vite.config.ts
echo ""
echo "Package.json scripts:"
cat package.json | grep -A 10 '"scripts"'
echo ""

# 13. Verificar se há erros no build
log "13. Verificando build..."
npm run build 2>&1 | tail -20
echo ""

# 14. Verificar componentes Material-UI
log "14. Verificando componentes Material-UI..."
grep -r "DialogContentText" node_modules/@mui/material/ 2>/dev/null | head -5 || echo "DialogContentText não encontrado nos node_modules"
echo ""

# 15. Verificar se há conflitos de versão
log "15. Verificando conflitos de versão..."
npm ls @mui/material @mui/icons-material @emotion/react @emotion/styled
echo ""

echo "🔍 DEBUG CONCLUÍDO"
echo "=============================================="
echo "Para ver logs em tempo real: pm2 logs --follow"
echo "Para reiniciar: pm2 restart all"
echo "Para verificar status: pm2 status" 
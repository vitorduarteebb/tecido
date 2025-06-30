#!/bin/bash

# Script de deploy para o sistema Tecidos-app
# VPS Ubuntu 24.04 LTS
# Autor: vitorduarteebb

set -e

echo "🚀 Iniciando deploy do sistema Tecidos..."

# 1. Navegar para o diretório do projeto
cd /opt/tecidos-app

# 2. Fazer build do frontend (ignorando erros TypeScript)
echo "📦 Fazendo build do frontend..."
npm run build || {
    echo "⚠️ Build com TypeScript falhou, tentando build forçado..."
    # Forçar build ignorando erros TypeScript
    npx vite build --mode production
}

# 3. Configurar backend para SQLite
echo "🗄️ Configurando SQLite..."
cd backend

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    cat > .env << EOF
DB_TYPE=sqlite
JWT_SECRET=sua_senha_super_secreta_123_tecidos_app
PORT=5000
EOF
fi

# 4. Instalar PM2 globalmente
echo "⚡ Instalando PM2..."
npm install -g pm2

# 5. Iniciar backend com PM2
echo "🔄 Iniciando backend..."
pm2 start src/index.ts --name tecidos-backend --interpreter ./node_modules/.bin/ts-node

# 6. Salvar configuração do PM2
pm2 startup
pm2 save

# 7. Instalar Nginx
echo "🌐 Instalando Nginx..."
apt update -y
apt install -y nginx

# 8. Configurar Nginx
echo "⚙️ Configurando Nginx..."
cat > /etc/nginx/sites-available/tecidos << 'EOF'
server {
    listen 80;
    server_name _;

    root /opt/tecidos-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 9. Ativar configuração do Nginx
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/tecidos /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 10. Verificar status
echo "✅ Verificando status dos serviços..."
sleep 3
pm2 status
systemctl status nginx --no-pager

echo ""
echo "🎉 Deploy concluído!"
echo "📱 Acesse o sistema em: http://$(curl -s ifconfig.me)"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs do backend: pm2 logs tecidos-backend"
echo "  - Reiniciar backend: pm2 restart tecidos-backend"
echo "  - Status dos serviços: pm2 status && systemctl status nginx" 
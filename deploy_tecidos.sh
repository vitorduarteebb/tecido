#!/bin/bash

# Script de deploy para o sistema Tecidos-app
# VPS Ubuntu 24.04 LTS
# Autor: vitorduarteebb

set -e

# 1. Atualizar sistema e instalar dependências
apt update && apt upgrade -y
apt install -y curl git nginx

# 2. Instalar Node.js 18.x e npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 3. Instalar pm2 globalmente
npm install -g pm2

# 4. Clonar o projeto (se já existe, apenas atualiza)
cd /root
if [ ! -d "/root/tecidos-app" ]; then
  git clone git@github.com:vitorduarteebb/tecido.git tecidos-app
else
  cd tecidos-app
  git pull
  cd ..
fi
cd tecidos-app

# 5. Instalar dependências do backend
cd backend && npm install

# 6. Instalar dependências do frontend
cd /root/tecidos-app && npm install

# 7. Build do frontend
npm run build

# 8. Rodar backend com pm2
cd /root/tecidos-app/backend
pm install # (garantia)
pm run build || true # caso use typescript
npm install -g ts-node || true # caso use ts-node
npm install -g typescript || true
pm2 delete tecidos-backend || true
pm2 start src/index.js --name tecidos-backend || pm2 start dist/index.js --name tecidos-backend

# 9. Configurar pm2 para iniciar com o sistema
pm2 startup systemd -u root --hp /root
pm2 save

# 10. Configurar nginx
cat > /etc/nginx/sites-available/tecidos <<EOF
server {
    listen 80;
    server_name _;

    root /root/tecidos-app/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/tecidos /etc/nginx/sites-enabled/tecidos
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "\n\nDeploy finalizado!\nAcesse: http://147.93.32.222/\n" 
# 🚀 DEPLOY AUTOMÁTICO GITHUB → VPS

## Configuração Completa para Deploy Automático

### PASSO 1: CONECTAR NA VPS
```bash
ssh root@147.93.32.222
```

### PASSO 2: BACKUP E PREPARAÇÃO
```bash
# Criar backup
mkdir -p /root/backups
if [ -d "/root/tecidos-app" ]; then
    cd /root/tecidos-app
    tar -czf /root/backups/backup-before-git-$(date +%Y%m%d-%H%M%S).tar.gz .
    mv /root/tecidos-app /root/tecidos-app-backup-$(date +%Y%m%d-%H%M%S)
fi

# Parar serviços
pm2 stop all
```

### PASSO 3: CLONAR REPOSITÓRIO DO GITHUB
```bash
cd /root
git clone https://github.com/vitorduarteebb/tecido.git tecidos-app
cd tecidos-app
```

### PASSO 4: INSTALAR DEPENDÊNCIAS E COMPILAR
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ..
npm install
npm run build
```

### PASSO 5: CRIAR SCRIPT DE DEPLOY AUTOMÁTICO
```bash
cat > /root/auto-deploy.sh << 'EOF'
#!/bin/bash
echo "=== DEPLOY AUTOMÁTICO INICIADO ==="
echo "Data: $(date)"

cd /root/tecidos-app

# Backup do banco
cp backend/database.sqlite /root/backups/database-auto-$(date +%Y%m%d-%H%M%S).sqlite 2>/dev/null

# Parar serviços
pm2 stop all

# Pull das mudanças
git pull origin main

# Compilar backend
cd backend
npm install
npm run build

# Compilar frontend
cd ..
npm install
npm run build

# Reiniciar serviços
pm2 start ecosystem.config.js
pm2 save

echo "=== DEPLOY CONCLUÍDO ==="
EOF

chmod +x /root/auto-deploy.sh
```

### PASSO 6: CONFIGURAR PM2
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'tecidos-backend',
      script: './backend/dist/index.js',
      cwd: '/root/tecidos-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'tecidos-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/root/tecidos-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
EOF
```

### PASSO 7: INSTALAR SERVE E INICIAR SERVIÇOS
```bash
npm install -g serve
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### PASSO 8: VERIFICAR STATUS
```bash
pm2 status
pm2 logs --lines 10
```

---

## 🔄 COMO USAR O DEPLOY AUTOMÁTICO

### Deploy Manual (quando necessário):
```bash
ssh root@147.93.32.222 "/root/auto-deploy.sh"
```

### Deploy via GitHub Push:
1. Faça suas modificações localmente
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Suas modificações"
   git push origin main
   ```
3. Na VPS, execute o deploy:
   ```bash
   ssh root@147.93.32.222 "/root/auto-deploy.sh"
   ```

---

## 🎯 RESULTADO ESPERADO

Após a configuração:

✅ **VPS configurada com repositório GitHub**
✅ **Script de deploy automático criado**
✅ **PM2 configurado para gerenciar serviços**
✅ **Frontend e Backend rodando automaticamente**

### URLs do Sistema:
- **Frontend:** http://147.93.32.222:3000
- **Backend:** http://147.93.32.222:5000

### Comandos Úteis:
- **Status:** `pm2 status`
- **Logs:** `pm2 logs`
- **Reiniciar:** `pm2 restart all`
- **Deploy:** `/root/auto-deploy.sh`

---

## 🔧 FLUXO DE TRABALHO

1. **Desenvolvimento Local** → Modificações no código
2. **Git Push** → `git push origin main`
3. **Deploy VPS** → `ssh root@147.93.32.222 "/root/auto-deploy.sh"`
4. **Sistema Atualizado** → Novas funcionalidades em produção

**🎉 DEPLOY AUTOMÁTICO CONFIGURADO COM SUCESSO!**
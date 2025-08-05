# 🎯 DEPLOY FINAL - GITHUB → VPS

## ✅ GITHUB ATUALIZADO COM SUCESSO!

**Commit realizado:** `feat: Implementa funcionalidades de representante e corrige importação de clientes`

**Push realizado:** Todas as modificações estão no GitHub: https://github.com/vitorduarteebb/tecido

---

## 🚀 PRÓXIMOS PASSOS NA VPS

### 1. CONECTAR NA VPS
```bash
ssh root@147.93.32.222
```

### 2. EXECUTAR COMANDOS NA VPS (copie e cole cada bloco):

#### BLOCO 1: Backup e Preparação
```bash
mkdir -p /root/backups
pm2 stop all
if [ -d "/root/tecidos-app" ]; then
    cd /root/tecidos-app
    tar -czf /root/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz .
    cd /root
    mv tecidos-app tecidos-app-backup-$(date +%Y%m%d-%H%M%S)
fi
```

#### BLOCO 2: Clonar do GitHub
```bash
cd /root
git clone https://github.com/vitorduarteebb/tecido.git tecidos-app
cd tecidos-app
```

#### BLOCO 3: Instalar Backend
```bash
cd backend
npm install
npm run build
```

#### BLOCO 4: Instalar Frontend
```bash
cd ..
npm install
npm run build
```

#### BLOCO 5: Configurar PM2
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'tecidos-backend',
      script: './backend/dist/index.js',
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
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
EOF
```

#### BLOCO 6: Instalar Serve e Iniciar
```bash
npm install -g serve
pm2 start ecosystem.config.js
pm2 save
```

#### BLOCO 7: Criar Script de Deploy Automático
```bash
cat > /root/auto-deploy.sh << 'EOF'
#!/bin/bash
echo "=== DEPLOY AUTOMÁTICO ==="
cd /root/tecidos-app
cp backend/database.sqlite /root/backups/database-$(date +%Y%m%d-%H%M%S).sqlite
pm2 stop all
git pull origin main
cd backend && npm install && npm run build
cd .. && npm install && npm run build
pm2 start ecosystem.config.js
pm2 save
echo "=== DEPLOY CONCLUÍDO ==="
EOF
chmod +x /root/auto-deploy.sh
```

#### BLOCO 8: Verificar Status
```bash
pm2 status
pm2 logs --lines 5
```

---

## 🎉 RESULTADO ESPERADO

Após executar todos os blocos:

✅ **Sistema rodando com as novas funcionalidades:**
- Importação de clientes corrigida
- Representante pode criar/importar clientes
- Atribuição automática funcionando

✅ **URLs do Sistema:**
- **Frontend:** http://147.93.32.222:3000
- **Backend:** http://147.93.32.222:5000

✅ **Deploy Automático Configurado:**
- Script: `/root/auto-deploy.sh`
- Para usar: `ssh root@147.93.32.222 "/root/auto-deploy.sh"`

---

## 🔄 FLUXO FUTURO

### Para futuras atualizações:

1. **Modificar código localmente**
2. **Commit e Push:**
   ```bash
   git add .
   git commit -m "Suas modificações"
   git push origin main
   ```
3. **Deploy na VPS:**
   ```bash
   ssh root@147.93.32.222 "/root/auto-deploy.sh"
   ```

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### ✅ **Importação de Clientes:**
- Arquivo `Clientes exemplo.xls` funciona perfeitamente
- Estrutura real detectada (header na linha 5)
- 4 clientes importados com sucesso

### ✅ **Representante:**
- Pode criar clientes (atribuição automática)
- Pode importar clientes (atribuição automática)
- Vê apenas seus clientes na listagem

### ✅ **Admin:**
- Vê todos os clientes
- Pode especificar representante ao criar cliente
- Controle total do sistema

**🎯 SISTEMA PRONTO PARA PRODUÇÃO!**
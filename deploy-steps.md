# DEPLOY VPS - SISTEMA DE TECIDOS

## VPS: 147.93.32.222
## Data: $(date)

### PASSO 1: CONECTAR VIA SSH
```bash
ssh root@147.93.32.222
```

### PASSO 2: BACKUP DO SISTEMA ATUAL
```bash
# Criar diretório de backup
mkdir -p /root/backups

# Backup do código atual
cd /root/tecidos-app
tar -czf /root/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# Backup do banco de dados
cp backend/database.sqlite /root/backups/database-$(date +%Y%m%d-%H%M%S).sqlite
```

### PASSO 3: ATUALIZAR SISTEMA OPERACIONAL
```bash
apt update && apt upgrade -y
```

### PASSO 4: PARAR SERVIÇOS
```bash
cd /root/tecidos-app
pm2 stop all
```

### PASSO 5: ATUALIZAR CÓDIGO (EXECUTAR NO SEU COMPUTADOR LOCAL)
```bash
# Backend
scp -r backend/src/* root@147.93.32.222:/root/tecidos-app/backend/src/
scp backend/package.json root@147.93.32.222:/root/tecidos-app/backend/
scp backend/tsconfig.json root@147.93.32.222:/root/tecidos-app/backend/

# Frontend
scp -r src/* root@147.93.32.222:/root/tecidos-app/src/
scp package.json root@147.93.32.222:/root/tecidos-app/
scp vite.config.ts root@147.93.32.222:/root/tecidos-app/
scp tailwind.config.js root@147.93.32.222:/root/tecidos-app/
scp tsconfig.json root@147.93.32.222:/root/tecidos-app/
```

### PASSO 6: COMPILAR BACKEND (NA VPS)
```bash
cd /root/tecidos-app/backend
npm install
npm run build
```

### PASSO 7: COMPILAR FRONTEND (NA VPS)
```bash
cd /root/tecidos-app
npm install
npm run build
```

### PASSO 8: REINICIAR SERVIÇOS
```bash
cd /root/tecidos-app
pm2 start ecosystem.config.js
pm2 save
```

### PASSO 9: VERIFICAR STATUS
```bash
pm2 status
pm2 logs --lines 10
```

## MODIFICAÇÕES IMPLEMENTADAS:

### ✅ FUNCIONALIDADES NOVAS:
1. **Importação de Clientes Corrigida** - Funciona com arquivo XLS real
2. **Representante Cria Cliente** - Atribuição automática
3. **Representante Importa Clientes** - Atribuição automática
4. **Middleware de Representante** - Controle de acesso
5. **Rotas Atualizadas** - Permissões corretas

### 🔧 ARQUIVOS MODIFICADOS:
- `backend/src/controllers/importController.ts` - Importação corrigida
- `backend/src/controllers/clienteController.ts` - Atribuição automática
- `backend/src/middleware/representanteMiddleware.ts` - Novo middleware
- `backend/src/routes/clienteRoutes.ts` - Rotas atualizadas
- `backend/src/routes/importRoutes.ts` - Rotas atualizadas

### 🎯 RESULTADO ESPERADO:
- Importação de clientes funcionando perfeitamente
- Representantes podem criar/importar clientes
- Clientes automaticamente atribuídos ao representante
- Sistema mais robusto e confiável 
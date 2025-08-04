# 🚀 DEPLOY VPS - INSTRUÇÕES FINAIS

## VPS: 147.93.32.222
## Data: $(Get-Date)

---

## 📋 RESUMO DAS MODIFICAÇÕES

### ✅ FUNCIONALIDADES IMPLEMENTADAS:
1. **Importação de Clientes Corrigida** - Funciona com arquivo XLS real
2. **Representante Cria Cliente** - Atribuição automática ao representante
3. **Representante Importa Clientes** - Atribuição automática ao representante
4. **Middleware de Representante** - Controle de acesso
5. **Rotas Atualizadas** - Permissões corretas

### 🔧 ARQUIVOS MODIFICADOS:
- `backend/src/controllers/importController.ts` - Importação corrigida
- `backend/src/controllers/clienteController.ts` - Atribuição automática
- `backend/src/middleware/representanteMiddleware.ts` - Novo middleware
- `backend/src/routes/clienteRoutes.ts` - Rotas atualizadas
- `backend/src/routes/importRoutes.ts` - Rotas atualizadas

---

## 🎯 COMANDOS PARA EXECUTAR NA VPS

### PASSO 1: CONECTAR VIA SSH
```bash
ssh root@147.93.32.222
```

### PASSO 2: BACKUP DO SISTEMA
```bash
# Criar backup
mkdir -p /root/backups
cd /root/tecidos-app
tar -czf /root/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz .
cp backend/database.sqlite /root/backups/database-$(date +%Y%m%d-%H%M%S).sqlite
```

### PASSO 3: ATUALIZAR SISTEMA
```bash
apt update && apt upgrade -y
```

### PASSO 4: PARAR SERVIÇOS
```bash
cd /root/tecidos-app
pm2 stop all
```

### PASSO 5: ATUALIZAR CÓDIGO (EXECUTAR NO SEU COMPUTADOR)
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

---

## 🎉 RESULTADO ESPERADO

Após o deploy, você terá:

### ✅ Importação de Clientes Funcionando:
- Arquivo `Clientes exemplo.xls` será importado corretamente
- 4 clientes serão criados com sucesso
- Sem erros de "Dados obrigatórios faltando"

### ✅ Representantes Podem:
- Criar clientes manualmente
- Importar clientes via Excel
- Ver apenas seus clientes na listagem
- Clientes automaticamente atribuídos a eles

### ✅ Administradores Podem:
- Ver todos os clientes
- Criar clientes para qualquer representante
- Importar clientes para qualquer representante

---

## 🔍 TESTE PÓS-DEPLOY

### 1. Testar Importação de Clientes:
- Acesse: `http://147.93.32.222/admin/importacao`
- Faça upload do arquivo `Clientes exemplo.xls`
- Verifique se importa 4 clientes com sucesso

### 2. Testar Representante:
- Login como representante: `representante@teste.com` / `123456`
- Criar um cliente novo
- Verificar se aparece na listagem

### 3. Verificar Logs:
```bash
pm2 logs --lines 20
```

---

## 📞 SUPORTE

Se houver algum problema durante o deploy:

1. **Verificar logs:** `pm2 logs`
2. **Restaurar backup:** `/root/backups/`
3. **Reiniciar serviços:** `pm2 restart all`
4. **Verificar status:** `pm2 status`

---

## ✅ CHECKLIST FINAL

- [ ] Backup criado
- [ ] Sistema atualizado
- [ ] Código transferido
- [ ] Backend compilado
- [ ] Frontend compilado
- [ ] Serviços reiniciados
- [ ] Importação testada
- [ ] Representante testado
- [ ] Logs verificados

**🎯 DEPLOY CONCLUÍDO COM SUCESSO!** 
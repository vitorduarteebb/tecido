# Gerenciamento de Senhas de Admin

## Problema: Esqueci a senha do admin

Se você esqueceu a senha do administrador, siga estes passos:

### 1. Verificar admins existentes
```bash
npx ts-node src/scripts/showAdminCredentials.ts
```

### 2. Se não houver admins, criar um novo
```bash
npx ts-node src/scripts/createAdminSqlite.ts
```

### 3. Redefinir senha do admin
```bash
npx ts-node src/scripts/resetAdminPassword.ts
```

## Credenciais padrão

Após executar os scripts acima, use estas credenciais:

- **Email:** admin@admin.com
- **Senha:** admin123

## Scripts disponíveis

| Script | Função |
|--------|--------|
| `showAdminCredentials.ts` | Mostra admins existentes e credenciais |
| `createAdminSqlite.ts` | Cria um novo admin |
| `resetAdminPassword.ts` | Redefine senha para 'admin123' |
| `checkAdmins.ts` | Lista admins (formato simples) |

## Segurança

⚠️ **IMPORTANTE:** Após fazer login com a senha padrão, altere-a imediatamente por segurança!

## Comandos rápidos

```bash
# Verificar admins
npx ts-node src/scripts/showAdminCredentials.ts

# Criar admin (se não existir)
npx ts-node src/scripts/createAdminSqlite.ts

# Redefinir senha
npx ts-node src/scripts/resetAdminPassword.ts
``` 
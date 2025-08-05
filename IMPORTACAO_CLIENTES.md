# Importação de Clientes

## Visão Geral

O sistema suporta importação em massa de clientes através de arquivos Excel (.xlsx ou .xls). A funcionalidade está disponível na página de **Importação** do painel administrativo.

## Campos Obrigatórios

Para que a importação seja bem-sucedida, os seguintes campos são **obrigatórios**:

| Campo | Variações Aceitas | Exemplo |
|-------|-------------------|---------|
| **Razão Social** | "Razão Social", "razao social", "empresa", "nome empresa", "cliente" | ABC Comércio Ltda |
| **CNPJ** | "CNPJ", "cnpj", "documento" | 12.345.678/0001-90 |
| **Email** | "Email", "email", "e-mail" | contato@empresa.com |
| **Telefone** | "Telefone", "telefone", "fone", "contato" | (11) 99999-9999 |

## Campos Opcionais

| Campo | Variações Aceitas | Exemplo |
|-------|-------------------|---------|
| Nome Fantasia | "Nome Fantasia", "nome fantasia", "fantasia" | ABC Store |
| Inscrição Estadual | "Inscrição Estadual", "inscricao estadual", "ie" | 123.456.789.012 |
| Celular | "Celular", "celular", "cel", "whatsapp" | (11) 98888-8888 |
| Endereço | "Endereço", "endereco", "rua", "logradouro" | Rua das Flores, 123 |
| Cidade | "Cidade", "cidade" | São Paulo |
| Estado | "Estado", "estado", "UF", "uf" | SP |
| CEP | "CEP", "cep", "codigo postal" | 01234-567 |
| Representantes | "Representantes", "representante", "vendedor" | João Silva |

## Estrutura do arquivo Excel

### Exemplo de cabeçalho correto:

```
| Razão Social | CNPJ | Email | Telefone | Nome Fantasia | Endereço |
```

### Exemplo de dados:

```
| ABC Comércio Ltda | 12.345.678/0001-90 | contato@abc.com | (11) 99999-9999 | ABC Store | Rua das Flores, 123 |
```

## Regras de Importação

### Validações
- **CNPJ**: Deve ser único no sistema (não pode haver duplicatas)
- **Email**: Será convertido para minúsculas automaticamente
- **Campos obrigatórios**: Todos os 4 campos obrigatórios devem estar preenchidos

### Comportamento
- **Clientes duplicados**: São identificados pelo CNPJ e ignorados automaticamente
- **Campos vazios**: Campos opcionais vazios recebem valores padrão
- **Inscrição Estadual**: Se não informada, será definida como "ISENTO"

## Problemas Comuns e Soluções

### 1. "Dados obrigatórios faltando"
**Causa**: Um ou mais campos obrigatórios estão vazios ou com nomes de coluna diferentes do esperado.

**Solução**:
- Verifique se todas as colunas obrigatórias estão presentes
- Certifique-se de que os nomes das colunas seguem as variações aceitas
- Verifique se não há linhas completamente vazias no meio dos dados

### 2. Erro de formato de arquivo
**Causa**: Arquivo não é um Excel válido ou está corrompido.

**Solução**:
- Use apenas arquivos .xlsx ou .xls
- Certifique-se de que o arquivo não está corrompido
- Tente salvar o arquivo novamente no Excel

### 3. CNPJs duplicados
**Causa**: Tentativa de importar clientes com CNPJs que já existem no sistema.

**Solução**:
- Os clientes duplicados são automaticamente ignorados
- Verifique o relatório de importação para ver quais foram duplicados

## Dicas para Sucesso na Importação

1. **Use a primeira linha para cabeçalhos**: Os nomes das colunas devem estar na primeira linha
2. **Mantenha consistência**: Use o mesmo formato de dados em toda a planilha
3. **Limpe os dados**: Remova linhas vazias e caracteres especiais desnecessários
4. **Teste com poucos registros**: Importe primeiro alguns registros para testar o formato

## Exemplo de Planilha Correta

```excel
Razão Social          | CNPJ              | Email              | Telefone        | Cidade      | Estado
ABC Comércio Ltda     | 12.345.678/0001-90| contato@abc.com   | (11) 99999-9999 | São Paulo   | SP
XYZ Indústria SA      | 98.765.432/0001-10| admin@xyz.com     | (21) 88888-8888 | Rio de Janeiro | RJ
```

## Suporte

Se continuar enfrentando problemas na importação:

1. Verifique os logs do servidor para mensagens de debug detalhadas
2. Certifique-se de que o formato do arquivo está correto
3. Tente importar com menos registros para identificar linhas problemáticas
# Importação de Produtos

## Visão Geral

O sistema agora suporta importação em massa de produtos através de arquivos Excel (.xlsx). A funcionalidade está disponível na página de **Importação** do painel administrativo.

## Como Usar

### 1. Acessar a Página de Importação

1. Faça login como administrador
2. Vá para **Importação** no menu lateral
3. Clique na seção **Importar Produtos**

### 2. Baixar o Template

1. Clique no botão **"Baixar Template"**
2. O arquivo `template_produtos.xlsx` será baixado
3. Use este template como base para seus dados

### 3. Preparar o Arquivo

O arquivo Excel deve conter as seguintes colunas:

| Coluna | Descrição | Obrigatório | Exemplo |
|--------|-----------|-------------|---------|
| Código do produto | Código único do produto | ✅ | 13206 |
| Nome do produto | Nome descritivo | ✅ | Tricoline 13206 Gatinhos |
| Preço de Tabela | Preço padrão | ✅ | 24.8 |
| Comissão | Percentual de comissão | ❌ | 5 |
| Unidade | Unidade de medida | ❌ | Metros |
| Quantidade em estoque | Quantidade disponível | ❌ | 5.85 |
| Peso bruto por metro (em Kg) | Peso por metro | ❌ | 0.18 |
| Categoria principal | Categoria do produto | ❌ | Tricoline Digital |
| Subcategoria | Subcategoria (vira tag) | ❌ | Natal |
| Tabela a Vista | Preço à vista | ❌ | 23.6 |

### 4. Importar os Dados

1. Clique em **"Selecionar Arquivo"**
2. Escolha seu arquivo Excel
3. Clique em **"Importar Produtos"**
4. Aguarde o processamento
5. Verifique o resultado da importação

## Regras de Importação

### Validações
- **Código do produto**: Deve ser único no sistema
- **Nome do produto**: Campo obrigatório
- **Preço de Tabela**: Deve ser um número válido
- **Cabeçalho**: O arquivo deve ter o cabeçalho correto na primeira linha

### Comportamento
- **Produtos duplicados**: São ignorados automaticamente
- **Campos vazios**: São preenchidos com valores padrão
- **Preços**: Se "Tabela a Vista" estiver vazio, usa o "Preço de Tabela"
- **Tags**: Subcategoria vira tag automaticamente
- **Estoque**: Quantidade em metros (padrão: 0)
- **Unidade**: Padrão é "Metros"

## Estrutura dos Dados Importados

### Produto
```json
{
  "codigo": "13206",
  "nome": "Tricoline 13206 Gatinhos",
  "descricao": "Tricoline 13206 Gatinhos",
  "especificacoes": {
    "descricao": "Tricoline 13206 Gatinhos",
    "composicao": "",
    "largura": "",
    "gramatura": "",
    "comissao": 5,
    "unidade": "Metros"
  },
  "preco": {
    "tabela": 24.8,
    "aVista": 23.6,
    "aPrazo": 24.8
  },
  "precoAVista": 23.6,
  "precoAPrazo": 24.8,
  "pesoPorMetro": 0.18,
  "estoque": {
    "quantidade": 5.85,
    "unidade": "Metros"
  },
  "categoria": "Tricoline Digital",
  "tags": [],
  "status": "ativo"
}
```

## Exemplo de Arquivo

```
Código do produto | Nome do produto | Preço de Tabela | Comissão | Unidade | Quantidade em estoque | Peso bruto por metro (em Kg) | Categoria principal | Subcategoria | Tabela a Vista
13206 | Tricoline 13206 Gatinhos | 24.8 | 5 | Metros | 5.85 | 0.18 | Tricoline Digital | | 23.6
13219 | Tricoline Papai Noel | 24.8 | 5 | Metros | 0 | 0.18 | Tricoline Digital | Natal | 23.6
```

## Scripts de Suporte

### Análise de Arquivo
```bash
npx ts-node src/scripts/analyzeProdutosFile.ts
```

### Teste de Importação
```bash
npx ts-node src/scripts/testImportProdutos.ts
```

### Listar Produtos Importados
```bash
npx ts-node src/scripts/listProdutosImportados.ts
```

### Gerar Template
```bash
npx ts-node src/scripts/generateProdutosTemplate.ts
```

## Troubleshooting

### Erro: "Cabeçalho não encontrado"
- Verifique se a primeira linha contém "Código do produto"
- Certifique-se de que não há linhas vazias antes do cabeçalho

### Erro: "Dados obrigatórios faltando"
- Verifique se todos os campos obrigatórios estão preenchidos
- Código, Nome e Preço de Tabela são obrigatórios

### Produtos não aparecem
- Verifique se não há produtos duplicados
- Use o script `listProdutosImportados.ts` para verificar

### Problemas de Encoding
- Salve o arquivo Excel como UTF-8
- Evite caracteres especiais nos nomes

## API Endpoint

```
POST /api/import/produtos
Content-Type: multipart/form-data

Body: file (arquivo Excel)
```

### Resposta
```json
{
  "message": "Importação concluída",
  "total": 7,
  "sucessos": 7,
  "duplicados": 0,
  "erros": 0,
  "errosDetalhados": []
}
```

## Segurança

- Apenas administradores podem importar produtos
- Arquivos são validados antes do processamento
- Produtos duplicados são ignorados automaticamente
- Logs de erro são mantidos para auditoria 
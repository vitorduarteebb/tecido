import * as XLSX from 'xlsx';
import * as path from 'path';
import { Produto } from '../models';
import { sequelize } from '../config/database';

async function importProdutos() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    // Caminho para o arquivo Excel
    const filePath = path.join(__dirname, '../../../produtos exemplo.xlsx');
    console.log('Lendo arquivo:', filePath);

    // Ler o arquivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON, incluindo linhas de cabeçalho
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Encontrados ${data.length} linhas no arquivo`);

    let sucessos = 0;
    let erros = 0;
    let duplicados = 0;

    // Procurar a linha de cabeçalho (onde está "Código do produto")
    const headerIndex = data.findIndex(row => row.includes('Código do produto\r\n'));
    if (headerIndex === -1) {
      console.log('Cabeçalho não encontrado!');
      process.exit(1);
    }

    const header = data[headerIndex];
    // Mapear índices das colunas
    const idx = {
      codigo: header.indexOf('Código do produto\r\n'),
      nome: header.indexOf('Nome do produto\r\n'),
      precoTabela: header.indexOf('Preço de Tabela\r\n'),
      precoAVista: header.indexOf('Tabela a Vista'),
      estoque: header.indexOf('Quantidade em estoque\r\n'),
      pesoPorMetro: header.indexOf('Peso bruto por metro (em Kg)\r\n'),
      categoria: header.indexOf('Categoria principal\r\n'),
      // Outras colunas podem ser mapeadas conforme necessário
    };

    for (let i = headerIndex + 1; i < data.length; i++) {
      const row = data[i];
      // Ignorar linhas vazias
      if (!row[idx.codigo] || !row[idx.nome] || !row[idx.precoTabela]) {
        continue;
      }
      try {
        // Verificar se o código já existe
        const codigo = row[idx.codigo]?.toString().trim();
        const produtoExistente = await Produto.findOne({ where: { codigo } });
        if (produtoExistente) {
          duplicados++;
          continue;
        }
        // Montar campos
        await Produto.create({
          codigo,
          nome: row[idx.nome]?.toString().trim(),
          descricao: row[idx.nome]?.toString().trim(),
          especificacoes: {},
          preco: {
            tabela: parseFloat(row[idx.precoTabela]) || 0,
            aVista: parseFloat(row[idx.precoAVista]) || 0
          },
          precoAVista: parseFloat(row[idx.precoAVista]) || 0,
          precoAPrazo: parseFloat(row[idx.precoTabela]) || 0,
          pesoPorMetro: parseFloat(row[idx.pesoPorMetro]) || 0,
          estoque: {
            quantidade: parseFloat(row[idx.estoque]) || 0,
            unidade: 'metros'
          },
          categoria: row[idx.categoria]?.toString().trim() || 'Geral',
          tags: [],
          status: 'ativo'
        });
        sucessos++;
      } catch (error) {
        console.error(`Linha ${i + 1}: Erro ao importar produto:`, error);
        erros++;
      }
    }

    console.log('\n=== RESUMO DA IMPORTAÇÃO ===');
    console.log(`Total de registros: ${data.length - headerIndex - 1}`);
    console.log(`Importados com sucesso: ${sucessos}`);
    console.log(`Duplicados (ignorados): ${duplicados}`);
    console.log(`Erros: ${erros}`);

    process.exit(0);
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
}

importProdutos(); 
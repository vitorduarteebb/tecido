import * as XLSX from 'xlsx';
import * as path from 'path';
import { Produto } from '../models';
import { sequelize } from '../config/database';

async function testImportProdutos() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    // Caminho para o arquivo Excel
    const filePath = path.join(__dirname, '../../../produtos exemplo (1).xlsx');
    console.log('Testando importação do arquivo:', filePath);

    // Ler o arquivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON, incluindo linhas de cabeçalho
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`\n📊 TESTE DE IMPORTAÇÃO DE PRODUTOS`);
    console.log('=====================================');
    console.log(`Total de linhas: ${data.length}`);
    console.log(`Planilha: ${sheetName}`);

    // Procurar a linha de cabeçalho
    const headerIndex = data.findIndex(row => 
      row && row.some((cell: any) => 
        cell && cell.toString().toLowerCase().includes('código do produto')
      )
    );

    if (headerIndex === -1) {
      console.log('❌ Cabeçalho não encontrado no arquivo');
      process.exit(1);
    }

    const header = data[headerIndex];
    console.log('\n✅ Cabeçalho encontrado na linha:', headerIndex + 1);
    
    // Mapear índices das colunas
    const idx = {
      codigo: header.findIndex((cell: any) => cell && cell.toString().includes('Código do produto')),
      nome: header.findIndex((cell: any) => cell && cell.toString().includes('Nome do produto')),
      precoTabela: header.findIndex((cell: any) => cell && cell.toString().includes('Preço de Tabela')),
      precoAVista: header.findIndex((cell: any) => cell && cell.toString().includes('Tabela a Vista')),
      comissao: header.findIndex((cell: any) => cell && cell.toString().includes('Comissão')),
      unidade: header.findIndex((cell: any) => cell && cell.toString().includes('Unidade')),
      estoque: header.findIndex((cell: any) => cell && cell.toString().includes('Quantidade em estoque')),
      pesoPorMetro: header.findIndex((cell: any) => cell && cell.toString().includes('Peso bruto por metro')),
      categoria: header.findIndex((cell: any) => cell && cell.toString().includes('Categoria principal')),
      subcategoria: header.findIndex((cell: any) => cell && cell.toString().includes('Subcategoria'))
    };

    console.log('\n📋 MAPEAMENTO DE COLUNAS:');
    console.log('==========================');
    Object.entries(idx).forEach(([key, value]) => {
      console.log(`${key}: ${value >= 0 ? '✅' : '❌'} (índice ${value})`);
    });

    let sucessos = 0;
    let erros = 0;
    let duplicados = 0;
    const errosDetalhados: string[] = [];

    // Processar linhas de dados
    for (let i = headerIndex + 1; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Ignorar linhas vazias
        if (!row || !row[idx.codigo] || !row[idx.nome] || !row[idx.precoTabela]) {
          continue;
        }

        const codigo = row[idx.codigo]?.toString().trim();
        const nome = row[idx.nome]?.toString().trim();
        const precoTabela = parseFloat(row[idx.precoTabela]) || 0;
        const precoAVista = parseFloat(row[idx.precoAVista]) || precoTabela;

        console.log(`\n📦 Processando produto: ${codigo} - ${nome}`);

        // Verificar se o código já existe
        const produtoExistente = await Produto.findOne({
          where: { codigo }
        });

        if (produtoExistente) {
          console.log(`⚠️  Produto ${codigo} já existe (duplicado)`);
          duplicados++;
          continue;
        }

        // Preparar especificações
        const especificacoes = {
          descricao: nome,
          composicao: '',
          largura: '',
          gramatura: '',
          comissao: parseFloat(row[idx.comissao]) || 0,
          unidade: row[idx.unidade]?.toString().trim() || 'Metros'
        };

        // Preparar preço
        const preco = {
          tabela: precoTabela,
          aVista: precoAVista,
          aPrazo: precoTabela
        };

        // Preparar estoque
        const estoque = {
          quantidade: parseFloat(row[idx.estoque]) || 0,
          unidade: row[idx.unidade]?.toString().trim() || 'Metros'
        };

        // Preparar categoria e tags
        const categoria = row[idx.categoria]?.toString().trim() || 'Geral';
        const subcategoria = row[idx.subcategoria]?.toString().trim();
        const tags = subcategoria ? [subcategoria] : [];

        // Criar produto
        await Produto.create({
          codigo,
          nome,
          descricao: nome,
          especificacoes,
          preco,
          precoAVista,
          precoAPrazo: precoTabela,
          pesoPorMetro: parseFloat(row[idx.pesoPorMetro]) || 0,
          estoque,
          categoria,
          tags,
          status: 'ativo'
        });

        console.log(`✅ Produto ${codigo} importado com sucesso`);
        sucessos++;

      } catch (error) {
        console.log(`❌ Erro na linha ${i + 1}:`, error);
        errosDetalhados.push(`Linha ${i + 1}: ${error}`);
        erros++;
      }
    }

    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log('==========================');
    console.log(`Total de registros: ${data.length - headerIndex - 1}`);
    console.log(`Importados com sucesso: ${sucessos}`);
    console.log(`Duplicados (ignorados): ${duplicados}`);
    console.log(`Erros: ${erros}`);

    if (errosDetalhados.length > 0) {
      console.log('\n❌ ERROS DETALHADOS:');
      console.log('=====================');
      errosDetalhados.forEach(erro => console.log(erro));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

testImportProdutos(); 
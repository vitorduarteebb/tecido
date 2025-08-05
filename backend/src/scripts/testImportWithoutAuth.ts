import * as XLSX from 'xlsx';
import * as path from 'path';
import { Cliente, Produto } from '../models';
import { sequelize } from '../config/database';

async function testImportWithoutAuth() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    // Testar importação de clientes
    console.log('\n=== TESTANDO IMPORTAÇÃO DE CLIENTES ===');
    const clientesPath = path.join(__dirname, '../../../Clientes exemplo.xls');
    console.log('Lendo arquivo:', clientesPath);

    const clientesWorkbook = XLSX.readFile(clientesPath);
    const clientesSheetName = clientesWorkbook.SheetNames[0];
    const clientesWorksheet = clientesWorkbook.Sheets[clientesSheetName];
    const clientesData: any[] = XLSX.utils.sheet_to_json(clientesWorksheet, { header: 1 });
    
    console.log(`Encontrados ${clientesData.length} linhas no arquivo de clientes`);

    // Procurar a linha de cabeçalho
    const clientesHeaderIndex = clientesData.findIndex(row => row.includes('Razão social'));
    if (clientesHeaderIndex === -1) {
      console.log('❌ Cabeçalho de clientes não encontrado!');
    } else {
      console.log('✅ Cabeçalho de clientes encontrado na linha:', clientesHeaderIndex + 1);
    }

    // Testar importação de produtos
    console.log('\n=== TESTANDO IMPORTAÇÃO DE PRODUTOS ===');
    const produtosPath = path.join(__dirname, '../../../produtos exemplo.xlsx');
    console.log('Lendo arquivo:', produtosPath);

    const produtosWorkbook = XLSX.readFile(produtosPath);
    const produtosSheetName = produtosWorkbook.SheetNames[0];
    const produtosWorksheet = produtosWorkbook.Sheets[produtosSheetName];
    const produtosData: any[] = XLSX.utils.sheet_to_json(produtosWorksheet, { header: 1 });
    
    console.log(`Encontrados ${produtosData.length} linhas no arquivo de produtos`);

    // Procurar a linha de cabeçalho
    const produtosHeaderIndex = produtosData.findIndex(row => row.includes('Código do produto\r\n'));
    if (produtosHeaderIndex === -1) {
      console.log('❌ Cabeçalho de produtos não encontrado!');
    } else {
      console.log('✅ Cabeçalho de produtos encontrado na linha:', produtosHeaderIndex + 1);
    }

    // Verificar se há dados no banco
    console.log('\n=== VERIFICANDO DADOS NO BANCO ===');
    const clientesCount = await Cliente.count();
    const produtosCount = await Produto.count();
    
    console.log(`Clientes no banco: ${clientesCount}`);
    console.log(`Produtos no banco: ${produtosCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
}

testImportWithoutAuth(); 
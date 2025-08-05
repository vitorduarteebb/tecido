import * as XLSX from 'xlsx';
import * as path from 'path';

async function analyzeProdutosFile() {
  try {
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
    console.log('\n=== ESTRUTURA DO ARQUIVO ===');
    
    // Mostrar as primeiras 5 linhas
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`Linha ${i + 1}:`, data[i]);
    }
    
    // Procurar por diferentes possíveis cabeçalhos
    const possibleHeaders = [
      'Código do produto',
      'Código do produto\r\n',
      'Nome do produto',
      'Nome do produto\r\n',
      'Preço de Tabela',
      'Preço de Tabela\r\n',
      'Quantidade em estoque',
      'Quantidade em estoque\r\n'
    ];
    
    console.log('\n=== PROCURANDO CABEÇALHOS ===');
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (Array.isArray(row)) {
        for (const header of possibleHeaders) {
          if (row.includes(header)) {
            console.log(`Cabeçalho "${header}" encontrado na linha ${i + 1}`);
            console.log('Linha completa:', row);
          }
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro geral:', error);
    process.exit(1);
  }
}

analyzeProdutosFile(); 
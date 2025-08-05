import * as XLSX from 'xlsx';
import * as path from 'path';

function checkExcelStructure(filePath: string, fileName: string) {
  try {
    console.log(`\n=== Verificando estrutura do arquivo: ${fileName} ===`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`Planilha encontrada: ${sheetName}`);
    
    // Converter para JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Total de registros: ${data.length}`);
    
    if (data.length > 0) {
      console.log('\nPrimeiro registro:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\nColunas encontradas:');
      const columns = Object.keys(data[0] as object);
      columns.forEach((col, index) => {
        console.log(`${index + 1}. ${col}`);
      });
    }
    
    // Verificar primeiras linhas
    console.log('\nPrimeiras 3 linhas:');
    for (let i = 0; i < Math.min(3, data.length); i++) {
      console.log(`Linha ${i + 1}:`, data[i]);
    }
    
  } catch (error) {
    console.error(`Erro ao ler arquivo ${fileName}:`, error);
  }
}

// Verificar arquivo de clientes
const clientesPath = path.join(__dirname, '../../../Clientes exemplo.xls');
checkExcelStructure(clientesPath, 'Clientes exemplo.xls');

// Verificar arquivo de produtos
const produtosPath = path.join(__dirname, '../../../produtos exemplo.xlsx');
checkExcelStructure(produtosPath, 'produtos exemplo.xlsx'); 
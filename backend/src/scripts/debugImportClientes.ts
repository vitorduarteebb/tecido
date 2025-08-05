import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Função para mapear campos de forma flexível
const mapearCamposCliente = (row: any) => {
  const campos = Object.keys(row);
  
  // Para arquivos com estrutura __EMPTY, mapear por posição conhecida
  const isEmptyStructure = campos.some(campo => campo.startsWith('__EMPTY'));
  
  if (isEmptyStructure) {
    // Mapeamento específico para a estrutura detectada do arquivo
    // Baseado na análise: __EMPTY_1 = CNPJ, __EMPTY_3 = Telefone, __EMPTY_4 = Email
    return {
      razaoSocial: row['Relatório de Clientes'] || null,
      nomeFantasia: row['__EMPTY'] || null,
      cnpj: row['__EMPTY_1'] || null,
      inscricaoEstadual: row['__EMPTY_2'] || null,
      telefone: row['__EMPTY_3'] || null,
      email: row['__EMPTY_4'] || null,
      endereco: row['__EMPTY_5'] || null,
      bairro: row['__EMPTY_6'] || null,
      cidade: row['__EMPTY_7'] || null,
      estado: row['__EMPTY_8'] || null,
      cep: row['__EMPTY_9'] || null,
      representantes: row['__EMPTY_10'] || null,
      celular: null // Não há coluna específica para celular neste formato
    };
  }

  // Fallback para estrutura normal
  const findField = (possibleNames: string[]) => {
    for (const name of possibleNames) {
      const found = campos.find(campo => 
        campo.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(campo.toLowerCase())
      );
      if (found && row[found]) return row[found];
    }
    return null;
  };

  return {
    razaoSocial: findField(['Razão Social', 'razao social', 'empresa', 'nome empresa', 'cliente']),
    cnpj: findField(['CNPJ', 'cnpj', 'documento']),
    email: findField(['Email', 'email', 'e-mail']),
    telefone: findField(['Telefone', 'telefone', 'fone', 'contato']),
    nomeFantasia: findField(['Nome Fantasia', 'nome fantasia', 'fantasia']),
    inscricaoEstadual: findField(['Inscrição Estadual', 'inscricao estadual', 'ie']),
    celular: findField(['Celular', 'celular', 'cel', 'whatsapp']),
    endereco: findField(['Endereço', 'endereco', 'rua', 'logradouro']),
    cidade: findField(['Cidade', 'cidade']),
    estado: findField(['Estado', 'estado', 'UF', 'uf']),
    cep: findField(['CEP', 'cep', 'codigo postal']),
    representantes: findField(['Representantes', 'representante', 'vendedor'])
  };
};

async function debugImportClientes() {
  try {
    // Procurar arquivos de exemplo na raiz do projeto
    const rootDir = path.join(__dirname, '../../../');
    const possibleFiles = [
      'Clientes exemplo.xls',
      'clientes exemplo.xlsx',
      'clientes.xlsx',
      'clientes.xls'
    ];

    let filePath = '';
    for (const file of possibleFiles) {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        filePath = fullPath;
        console.log(`✅ Arquivo encontrado: ${file}`);
        break;
      }
    }

    if (!filePath) {
      console.log('❌ Nenhum arquivo de exemplo encontrado. Arquivos procurados:');
      possibleFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
      return;
    }

    console.log('\n=== ANÁLISE DO ARQUIVO DE IMPORTAÇÃO ===');
    
    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`📄 Arquivo: ${path.basename(filePath)}`);
    console.log(`📊 Planilha: ${sheetName}`);
    
    // Converter para JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`📝 Total de linhas de dados: ${data.length}`);
    
    if (data.length === 0) {
      console.log('❌ Nenhum dado encontrado no arquivo!');
      return;
    }

    // Mostrar informações da primeira linha (cabeçalhos)
    console.log('\n=== ANÁLISE DOS CABEÇALHOS ===');
    if (typeof data[0] === 'object' && data[0] !== null) {
      const headers = Object.keys(data[0] as any);
      console.log('🏷️ Cabeçalhos encontrados:');
      headers.forEach((header, index) => {
        console.log(`  ${index + 1}. "${header}"`);
      });
    }

    // Analisar cada linha
    console.log('\n=== ANÁLISE DOS DADOS ===');
    
    let sucessos = 0;
    let erros = 0;

    for (let i = 0; i < Math.min(data.length, 10); i++) { // Limitar a 10 linhas para debug
      const row: any = data[i];
      
      console.log(`\n--- LINHA ${i + 2} ---`);
      console.log('📄 Dados brutos:', row);
      
      // Mapear campos
      const campos = mapearCamposCliente(row);
      console.log('🔄 Campos mapeados:', campos);
      
      // Pular linhas que são cabeçalhos ou títulos
      const isHeaderOrTitle = 
        campos.razaoSocial === 'Emitido em 04/07/2025' ||
        campos.razaoSocial === 'Razão social' ||
        !campos.razaoSocial ||
        campos.razaoSocial.toString().toLowerCase().includes('relatório') ||
        campos.razaoSocial.toString().toLowerCase().includes('emitido em');
        
      if (isHeaderOrTitle) {
        console.log(`⏭️ Pulando linha ${i + 2} (cabeçalho/título):`, campos.razaoSocial);
        continue;
      }
      
      // Validar dados obrigatórios
      const camposObrigatorios = {
        'Razão Social': campos.razaoSocial,
        'CNPJ': campos.cnpj,
        'Email': campos.email,
        'Telefone': campos.telefone
      };
      
      console.log('✅ Validação dos campos obrigatórios:');
      let temErro = false;
      const camposFaltando: string[] = [];
      
      Object.entries(camposObrigatorios).forEach(([nome, valor]) => {
        const status = valor ? '✅' : '❌';
        console.log(`  ${status} ${nome}: ${valor || 'VAZIO/NULO'}`);
        if (!valor) {
          temErro = true;
          camposFaltando.push(nome);
        }
      });
      
      if (temErro) {
        console.log(`❌ ERRO: Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
        erros++;
      } else {
        console.log('✅ Linha válida!');
        sucessos++;
      }
    }
    
    console.log('\n=== RESUMO ===');
    console.log(`✅ Linhas válidas: ${sucessos}`);
    console.log(`❌ Linhas com erro: ${erros}`);
    console.log(`📊 Total analisado: ${Math.min(data.length, 10)} de ${data.length} linhas`);
    
    if (erros > 0) {
      console.log('\n=== SOLUÇÕES RECOMENDADAS ===');
      console.log('1. Verifique se os cabeçalhos estão corretos');
      console.log('2. Certifique-se de que os campos obrigatórios estão preenchidos');
      console.log('3. Remova linhas vazias');
      console.log('4. Use nomes de colunas como: "Razão Social", "CNPJ", "Email", "Telefone"');
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar arquivo:', error);
  }
}

debugImportClientes();
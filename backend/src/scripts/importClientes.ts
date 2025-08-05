import * as XLSX from 'xlsx';
import * as path from 'path';
import { Cliente } from '../models';
import { sequelize } from '../config/database';

async function importClientes() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    // Caminho para o arquivo Excel
    const filePath = path.join(__dirname, '../../../Clientes exemplo.xls');
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

    // Procurar a linha de cabeçalho (onde está "Razão social")
    const headerIndex = data.findIndex(row => row.includes('Razão social'));
    if (headerIndex === -1) {
      console.log('Cabeçalho não encontrado!');
      process.exit(1);
    }

    const header = data[headerIndex];
    // Mapear índices das colunas
    const idx = {
      razaoSocial: header.indexOf('Razão social'),
      nomeFantasia: header.indexOf('Nome fantasia'),
      cnpj: header.indexOf('CNPJ/CPF'),
      inscricaoEstadual: header.indexOf('Inscrição Estadual'),
      telefone: header.indexOf('Telefones'),
      email: header.indexOf('E-mails'),
      endereco: header.indexOf('Endereço principal'),
      bairro: header.indexOf('Bairro'),
      cidade: header.indexOf('Cidade'),
      estado: header.indexOf('Estado'),
      cep: header.indexOf('CEP'),
      contato: header.indexOf('Contato'),
    };

    for (let i = headerIndex + 1; i < data.length; i++) {
      const row = data[i];
      // Ignorar linhas vazias
      if (!row[idx.razaoSocial] || !row[idx.cnpj] || !row[idx.email] || !row[idx.telefone]) {
        continue;
      }
      try {
        // Verificar se o CNPJ já existe
        const cnpj = row[idx.cnpj]?.toString().replace(/\D/g, '');
        const clienteExistente = await Cliente.findOne({ where: { cnpj } });
        if (clienteExistente) {
          duplicados++;
          continue;
        }
        // Montar endereço
        const endereco = {
          endereco: row[idx.endereco] || '',
          bairro: row[idx.bairro] || '',
          cidade: row[idx.cidade] || '',
          estado: row[idx.estado] || '',
          cep: row[idx.cep] || '',
          contato: row[idx.contato] || ''
        };
        await Cliente.create({
          razaoSocial: row[idx.razaoSocial]?.toString().trim(),
          nomeFantasia: row[idx.nomeFantasia]?.toString().trim() || row[idx.razaoSocial]?.toString().trim(),
          cnpj,
          inscricaoEstadual: row[idx.inscricaoEstadual]?.toString().trim() || 'ISENTO',
          email: row[idx.email]?.toString().trim().toLowerCase(),
          telefone: row[idx.telefone]?.toString().trim(),
          endereco,
          status: 'ativo',
        });
        sucessos++;
      } catch (error) {
        console.error(`Linha ${i + 1}: Erro ao importar cliente:`, error);
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

importClientes(); 
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testImportAPI() {
  try {
    console.log('🧪 Testando API de Importação...');
    
    // Testar importação de clientes
    console.log('\n📋 Testando importação de clientes...');
    const clientesForm = new FormData();
    clientesForm.append('file', fs.createReadStream('Clientes exemplo.xls'));
    
    const clientesResponse = await axios.post('http://localhost:3001/api/import/clientes', clientesForm, {
      headers: {
        ...clientesForm.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Substitua pelo token real
      }
    });
    
    console.log('✅ Importação de clientes:', clientesResponse.data);
    
    // Testar importação de produtos
    console.log('\n📦 Testando importação de produtos...');
    const produtosForm = new FormData();
    produtosForm.append('file', fs.createReadStream('produtos exemplo.xlsx'));
    
    const produtosResponse = await axios.post('http://localhost:3001/api/import/produtos', produtosForm, {
      headers: {
        ...produtosForm.getHeaders(),
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Substitua pelo token real
      }
    });
    
    console.log('✅ Importação de produtos:', produtosResponse.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testImportAPI(); 
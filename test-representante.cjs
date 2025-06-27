const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

// Token de admin (você precisa pegar um token válido do login)
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzM4Y2Q3ZjhjNjM4OGRhYTBjYTZkZSIsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNzUwODcwNDExLCJleHAiOjE3NTA5NTY4MTF9.U1sOETkZtXHk_Lk4DX6t_L6-t8FKT1izHkRwbme_dTs';

async function testarCriacaoRepresentante() {
  try {
    console.log('=== TESTE DE CRIAÇÃO DE REPRESENTANTE ===');
    
    const dadosRepresentante = {
      nome: "Teste Frontend",
      email: "testefrontend@teste.com",
      telefone: "11999999999",
      regiao: "São Paulo",
      status: "ATIVO",
      comissao: 10,
      senha: "123456"
    };

    console.log('Dados a serem enviados:', JSON.stringify(dadosRepresentante, null, 2));

    const response = await axios.post(`${API_BASE_URL}/representantes`, dadosRepresentante, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    console.log('✅ Sucesso!');
    console.log('Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Erro!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Erro:', error.message);
    }
  }
}

// Executar o teste
testarCriacaoRepresentante();

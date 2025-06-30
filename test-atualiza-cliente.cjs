const axios = require('axios');

async function atualizarClienteCompleto() {
  try {
    // Login para obter token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@tecidos.com',
      senha: 'admin123',
      role: 'ADMINISTRADOR'
    });
    const token = loginResponse.data.token;
    console.log('Token obtido:', token);

    // ID do cliente a ser atualizado
    const clienteId = '68621f1ce3202ddcdd25da0e';

    // Dados completos para atualizar
    const dados = {
      razaoSocial: 'NOVO CLIENTE',
      nomeFantasia: 'NOVO',
      cnpj: '21.345.678/9665-41',
      inscricaoEstadual: '123456789',
      email: 'cliente@teste.com',
      telefone: '(11) 99999-9999',
      celular: '(11) 98888-8888',
      endereco: {
        cep: '01234-567',
        logradouro: 'Rua Teste',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      status: 'ativo',
      representantes: [],
      limiteCredito: 10000,
      condicaoPagamento: 'avista'
    };

    // Atualizar cliente
    const response = await axios.put(`http://localhost:3001/api/clientes/${clienteId}`, dados, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Cliente atualizado:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error.response?.data || error.message);
  }
}

atualizarClienteCompleto(); 
const axios = require('axios');

async function testClienteAPI() {
  try {
    // Primeiro, fazer login para obter o token
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: 'admin@tecidos.com',
      senha: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('Token obtido:', token);

    // Buscar o cliente específico
    const clienteId = '68621f1ce3202ddcdd25da0e';
    const clienteResponse = await axios.get(`http://localhost:3000/clientes/${clienteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Cliente retornado pela API:');
    console.log(JSON.stringify(clienteResponse.data, null, 2));

  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

testClienteAPI(); 
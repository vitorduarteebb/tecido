const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzM4Y2Q3ZjhjNjM4OGRhYTBjYTZkZSIsInJvbGUiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNzUxMjU2MTMyLCJleHAiOjE3NTEzNDI1MzJ9.qTTHOURAK0NAqKJV0IfbJmbVLcA1Cdf9JKFIhmegW78';

const pedidoData = {
  cliente: '683623ac9819d49282d3045f', // ID de um cliente existente
  representante: '68338cd7f8c6388daa0ca6de', // ID do admin
  itens: [
    {
      produto: '683623ac9819d49282d3045f', // ID de um produto existente
      quantidade: 1,
      valorUnitario: 10.00,
      valorTotal: 10.00
    }
  ],
  valorTotal: 10.00,
  condicaoPagamento: 'avista',
  pesoTotal: 1.0,
  observacoes: 'Teste de criação de pedido'
};

async function testarCriacaoPedido() {
  try {
    console.log('Testando criação de pedido...');
    const response = await axios.post('http://localhost:3001/api/pedidos', pedidoData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Pedido criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar pedido:', error.response?.data || error.message);
  }
}

testarCriacaoPedido(); 
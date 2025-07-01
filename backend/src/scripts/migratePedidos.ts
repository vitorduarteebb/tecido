/*
// Script desativado pois dependia de Mongoose e não é mais compatível com Sequelize.

import mongoose from 'mongoose';
import { Pedido } from '../models/Pedido';
import { config } from '../config';

async function adicionarNumerosPedido() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Conectado ao MongoDB');

    // Busca todos os pedidos que não têm número
    const pedidosSemNumero = await Pedido.find({ numeroPedido: { $exists: false } });
    console.log(`Encontrados ${pedidosSemNumero.length} pedidos sem número`);

    if (pedidosSemNumero.length === 0) {
      console.log('Todos os pedidos já têm números');
      return;
    }

    // Busca o último pedido com número para continuar a sequência
    const ultimoPedido = await Pedido.findOne({ numeroPedido: { $exists: true } }, {}, { sort: { 'numeroPedido': -1 } });
    
    let proximoNumero = 1;
    if (ultimoPedido && ultimoPedido.numeroPedido) {
      const match = ultimoPedido.numeroPedido.match(/PED-(\d{4})-(\d{4})/);
      if (match) {
        const ano = parseInt(match[1]);
        const numero = parseInt(match[2]);
        const anoAtual = new Date().getFullYear();
        
        if (ano === anoAtual) {
          proximoNumero = numero + 1;
        }
      }
    }

    const anoAtual = new Date().getFullYear();

    // Adiciona números aos pedidos
    for (const pedido of pedidosSemNumero) {
      const numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
      
      await Pedido.findByIdAndUpdate(pedido._id, { numeroPedido });
      console.log(`Pedido ${pedido._id} recebeu número: ${numeroPedido}`);
      
      proximoNumero++;
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro na migração:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Executa o script se for chamado diretamente
if (require.main === module) {
  adicionarNumerosPedido();
}

export { adicionarNumerosPedido }; 
*/ 
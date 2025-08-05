import { Produto } from '../src/models/Produto';
import sequelize from '../src/config/database';

async function listProdutos() {
  try {
    await sequelize.sync();
    const produtos = await Produto.findAll({ attributes: ['id', 'nome', 'preco'] });
    if (produtos.length === 0) {
      console.log('Nenhum produto cadastrado.');
    } else {
      produtos.forEach(prod => {
        console.log(`ID: ${prod.id}, Nome: ${prod.nome}, Preço: ${prod.preco}`);
      });
    }
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
  } finally {
    process.exit(0);
  }
}

listProdutos(); 
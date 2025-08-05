import { Admin, Representante } from '../src/models';
import { sequelize } from '../src/config/database';

async function createRepresentanteAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');
    const admin = await Admin.findOne();
    if (!admin) {
      console.log('Nenhum admin encontrado.');
      process.exit(1);
    }
    const representanteExistente = await Representante.findOne({ where: { id: admin.id } });
    if (representanteExistente) {
      console.log('Representante já existe para o admin:', admin.nome);
      process.exit(0);
    }
    await Representante.create({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      telefone: '000000000',
      regiao: 'Geral',
      status: 'Ativo',
      senha: admin.senha,
      comissao: 0
    });
    console.log('Representante criado para o admin:', admin.nome);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar representante para admin:', error);
    process.exit(1);
  }
}

createRepresentanteAdmin(); 
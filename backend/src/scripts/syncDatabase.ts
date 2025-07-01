import { sequelize } from '../models';

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando banco de dados...');
    await sequelize.sync({ force: true });
    console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase(); 
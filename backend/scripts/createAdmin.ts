import { Admin } from '../src/models/Admin';
import sequelize from '../src/config/database';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await sequelize.sync();
    const nome = 'Admin Teste';
    const email = 'admin@teste.com';
    const senha = '123456';
    const senhaHash = await bcrypt.hash(senha, 10);

    const [admin, created] = await Admin.findOrCreate({
      where: { email },
      defaults: { nome, email, senha: senhaHash }
    });

    if (created) {
      console.log('Admin criado com sucesso!');
    } else {
      console.log('Admin já existe.');
    }
    console.log(`ID: ${admin.id}, Email: ${admin.email}, Senha: 123456`);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    process.exit(0);
  }
}

createAdmin(); 
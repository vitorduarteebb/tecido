import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

// Definindo o model Admin (ajuste os campos conforme seu sistema)
const Admin = sequelize.define('Admin', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'admins',
  timestamps: false
});

async function createAdmin() {
  await sequelize.sync();

  const nome = 'Administrador';
  const email = 'admin@admin.com';
  const senha = 'admin123';

  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    const [admin, created] = await Admin.findOrCreate({
      where: { email },
      defaults: { nome, email, senha: senhaHash }
    });

    if (created) {
      console.log('Admin criado com sucesso!');
    } else {
      console.log('Já existe um admin com esse e-mail.');
    }
  } catch (err) {
    console.error('Erro ao criar admin:', err);
  } finally {
    await sequelize.close();
  }
}

createAdmin(); 
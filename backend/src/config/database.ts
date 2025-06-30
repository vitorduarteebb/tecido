import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = path.join(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('SQLite conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar SQLite:', error);
    process.exit(1);
  }
};

export default sequelize; 
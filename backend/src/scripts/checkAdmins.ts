import { Admin } from '../models';
import { sequelize } from '../config/database';

async function checkAdmins() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');
    
    const admins = await Admin.findAll();
    console.log('Admins encontrados:', admins.length);
    
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}`);
      console.log(`  Nome: ${admin.nome}`);
      console.log(`  Email: ${admin.email}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkAdmins(); 
import { Admin } from '../src/models/Admin';
import { Representante } from '../src/models/Representante';
import sequelize from '../src/config/database';

async function listUsers() {
  try {
    await sequelize.sync();
    
    console.log('=== ADMINS ===');
    const admins = await Admin.findAll({
      attributes: ['id', 'nome', 'email']
    });
    
    admins.forEach(admin => {
      console.log(`ID: ${admin.id}, Nome: ${admin.nome}, Email: ${admin.email}`);
    });
    
    console.log('\n=== REPRESENTANTES ===');
    const representantes = await Representante.findAll({
      attributes: ['id', 'nome', 'email']
    });
    
    representantes.forEach(rep => {
      console.log(`ID: ${rep.id}, Nome: ${rep.nome}, Email: ${rep.email}`);
    });
    
    console.log(`\nTotal: ${admins.length} admins, ${representantes.length} representantes`);
    
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
  } finally {
    process.exit(0);
  }
}

listUsers(); 
import { Admin } from '../models';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');
    
    // Buscar todos os admins
    const admins = await Admin.findAll();
    
    if (admins.length === 0) {
      console.log('Nenhum admin encontrado no banco de dados');
      process.exit(1);
    }
    
    console.log('Admins encontrados:');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ID: ${admin.id}`);
      console.log(`   Nome: ${admin.nome}`);
      console.log(`   Email: ${admin.email}`);
      console.log('---');
    });
    
    // Nova senha padrão
    const novaSenha = 'admin123';
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar a senha de todos os admins
    for (const admin of admins) {
      await admin.update({ senha: senhaHash });
      console.log(`Senha do admin ${admin.nome} (${admin.email}) foi redefinida para: ${novaSenha}`);
    }
    
    console.log('\n✅ Senhas redefinidas com sucesso!');
    console.log(`Nova senha para todos os admins: ${novaSenha}`);
    console.log('⚠️  IMPORTANTE: Altere esta senha após o primeiro login por segurança!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

resetAdminPassword(); 
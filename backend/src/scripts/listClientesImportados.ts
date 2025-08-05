import { Cliente } from '../models';
import { sequelize } from '../config/database';

async function listClientesImportados() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');

    const clientes = await Cliente.findAll({
      order: [['razaoSocial', 'ASC']]
    });

    console.log(`\n📋 CLIENTES IMPORTADOS (${clientes.length} total)`);
    console.log('=====================================\n');

    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ${cliente.razaoSocial}`);
      console.log(`   Nome Fantasia: ${cliente.nomeFantasia}`);
      console.log(`   CNPJ: ${cliente.cnpj}`);
      console.log(`   Email: ${cliente.email}`);
      console.log(`   Telefone: ${cliente.telefone}`);
      console.log(`   Cidade: ${cliente.endereco?.cidade || 'N/A'}`);
      console.log(`   Estado: ${cliente.endereco?.estado || 'N/A'}`);
      console.log(`   Status: ${cliente.status}`);
      console.log('   ---');
    });

    // Estatísticas
    const estados = clientes.reduce((acc, cliente) => {
      const estado = cliente.endereco?.estado || 'N/A';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('\n📊 ESTATÍSTICAS:');
    console.log('==================');
    Object.entries(estados).forEach(([estado, count]) => {
      console.log(`${estado}: ${count} clientes`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

listClientesImportados(); 
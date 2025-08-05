"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = require("../config/database");
async function showAdminCredentials() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        const admins = await models_1.Admin.findAll();
        if (admins.length === 0) {
            console.log('❌ Nenhum admin encontrado no banco de dados');
            console.log('Execute: npx ts-node src/scripts/createAdminSqlite.ts');
            process.exit(1);
        }
        console.log('📋 Admins encontrados:');
        console.log('=====================');
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. Admin ${index + 1}`);
            console.log(`   Nome: ${admin.nome}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   ID: ${admin.id}`);
            console.log('---');
        });
        console.log('🔑 Credenciais padrão:');
        console.log('   Email: admin@admin.com');
        console.log('   Senha: admin123');
        console.log('');
        console.log('💡 Para redefinir a senha, execute:');
        console.log('   npx ts-node src/scripts/resetAdminPassword.ts');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}
showAdminCredentials();

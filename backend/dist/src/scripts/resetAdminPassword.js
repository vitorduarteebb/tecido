"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = require("../config/database");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function resetAdminPassword() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        // Buscar todos os admins
        const admins = await models_1.Admin.findAll();
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
        const senhaHash = await bcryptjs_1.default.hash(novaSenha, 10);
        // Atualizar a senha de todos os admins
        for (const admin of admins) {
            await admin.update({ senha: senhaHash });
            console.log(`Senha do admin ${admin.nome} (${admin.email}) foi redefinida para: ${novaSenha}`);
        }
        console.log('\n✅ Senhas redefinidas com sucesso!');
        console.log(`Nova senha para todos os admins: ${novaSenha}`);
        console.log('⚠️  IMPORTANTE: Altere esta senha após o primeiro login por segurança!');
        process.exit(0);
    }
    catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}
resetAdminPassword();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = require("../src/models/Admin");
const database_1 = __importDefault(require("../src/config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createAdmin() {
    try {
        await database_1.default.sync();
        const nome = 'Admin Teste';
        const email = 'admin@teste.com';
        const senha = '123456';
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const [admin, created] = await Admin_1.Admin.findOrCreate({
            where: { email },
            defaults: { nome, email, senha: senhaHash }
        });
        if (created) {
            console.log('Admin criado com sucesso!');
        }
        else {
            console.log('Admin já existe.');
        }
        console.log(`ID: ${admin.id}, Email: ${admin.email}, Senha: 123456`);
    }
    catch (error) {
        console.error('Erro ao criar admin:', error);
    }
    finally {
        process.exit(0);
    }
}
createAdmin();

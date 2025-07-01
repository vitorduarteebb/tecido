"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = require("../src/models/Admin");
const Representante_1 = require("../src/models/Representante");
const database_1 = __importDefault(require("../src/config/database"));
async function listUsers() {
    try {
        await database_1.default.sync();
        console.log('=== ADMINS ===');
        const admins = await Admin_1.Admin.findAll({
            attributes: ['id', 'nome', 'email']
        });
        admins.forEach(admin => {
            console.log(`ID: ${admin.id}, Nome: ${admin.nome}, Email: ${admin.email}`);
        });
        console.log('\n=== REPRESENTANTES ===');
        const representantes = await Representante_1.Representante.findAll({
            attributes: ['id', 'nome', 'email']
        });
        representantes.forEach(rep => {
            console.log(`ID: ${rep.id}, Nome: ${rep.nome}, Email: ${rep.email}`);
        });
        console.log(`\nTotal: ${admins.length} admins, ${representantes.length} representantes`);
    }
    catch (error) {
        console.error('Erro ao listar usuários:', error);
    }
    finally {
        process.exit(0);
    }
}
listUsers();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Definindo o model Admin (ajuste os campos conforme seu sistema)
const Admin = database_1.sequelize.define('Admin', {
    nome: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: sequelize_1.DataTypes.STRING, allowNull: false }
}, {
    tableName: 'admins',
    timestamps: false
});
async function createAdmin() {
    await database_1.sequelize.sync();
    const nome = 'Administrador';
    const email = 'admin@admin.com';
    const senha = 'admin123';
    const senhaHash = await bcryptjs_1.default.hash(senha, 10);
    try {
        const [admin, created] = await Admin.findOrCreate({
            where: { email },
            defaults: { nome, email, senha: senhaHash }
        });
        if (created) {
            console.log('Admin criado com sucesso!');
        }
        else {
            console.log('Já existe um admin com esse e-mail.');
        }
    }
    catch (err) {
        console.error('Erro ao criar admin:', err);
    }
    finally {
        await database_1.sequelize.close();
    }
}
createAdmin();

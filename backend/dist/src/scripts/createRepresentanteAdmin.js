"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = require("../config/database");
async function createRepresentanteAdmin() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        const admin = await models_1.Admin.findOne();
        if (!admin) {
            console.log('Nenhum admin encontrado.');
            process.exit(1);
        }
        const representanteExistente = await models_1.Representante.findOne({ where: { id: admin.id } });
        if (representanteExistente) {
            console.log('Representante já existe para o admin:', admin.nome);
            process.exit(0);
        }
        await models_1.Representante.create({
            id: admin.id,
            nome: admin.nome,
            email: admin.email,
            telefone: '000000000',
            regiao: 'Geral',
            status: 'Ativo',
            senha: admin.senha,
            comissao: 0
        });
        console.log('Representante criado para o admin:', admin.nome);
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao criar representante para admin:', error);
        process.exit(1);
    }
}
createRepresentanteAdmin();

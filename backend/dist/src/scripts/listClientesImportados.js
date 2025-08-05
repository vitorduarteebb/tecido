"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = require("../config/database");
async function listClientesImportados() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        const clientes = await models_1.Cliente.findAll({
            order: [['razaoSocial', 'ASC']]
        });
        console.log(`\n📋 CLIENTES IMPORTADOS (${clientes.length} total)`);
        console.log('=====================================\n');
        clientes.forEach((cliente, index) => {
            var _a, _b;
            console.log(`${index + 1}. ${cliente.razaoSocial}`);
            console.log(`   Nome Fantasia: ${cliente.nomeFantasia}`);
            console.log(`   CNPJ: ${cliente.cnpj}`);
            console.log(`   Email: ${cliente.email}`);
            console.log(`   Telefone: ${cliente.telefone}`);
            console.log(`   Cidade: ${((_a = cliente.endereco) === null || _a === void 0 ? void 0 : _a.cidade) || 'N/A'}`);
            console.log(`   Estado: ${((_b = cliente.endereco) === null || _b === void 0 ? void 0 : _b.estado) || 'N/A'}`);
            console.log(`   Status: ${cliente.status}`);
            console.log('   ---');
        });
        // Estatísticas
        const estados = clientes.reduce((acc, cliente) => {
            var _a;
            const estado = ((_a = cliente.endereco) === null || _a === void 0 ? void 0 : _a.estado) || 'N/A';
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        console.log('\n📊 ESTATÍSTICAS:');
        console.log('==================');
        Object.entries(estados).forEach(([estado, count]) => {
            console.log(`${estado}: ${count} clientes`);
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}
listClientesImportados();

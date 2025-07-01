"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = require("../config/database");
async function checkAdmins() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        const admins = await models_1.Admin.findAll();
        console.log('Admins encontrados:', admins.length);
        admins.forEach(admin => {
            console.log(`- ID: ${admin.id}`);
            console.log(`  Nome: ${admin.nome}`);
            console.log(`  Email: ${admin.email}`);
            console.log('---');
        });
        process.exit(0);
    }
    catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}
checkAdmins();

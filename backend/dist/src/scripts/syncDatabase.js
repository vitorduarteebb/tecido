"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
async function syncDatabase() {
    try {
        console.log('🔄 Sincronizando banco de dados...');
        await models_1.sequelize.sync({ force: true });
        console.log('✅ Tabelas criadas com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro ao sincronizar banco:', error);
    }
    finally {
        await models_1.sequelize.close();
    }
}
syncDatabase();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Representante = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Representante extends sequelize_1.Model {
}
exports.Representante = Representante;
Representante.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    telefone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    regiao: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Ativo', 'Inativo'),
        allowNull: false,
        defaultValue: 'Ativo',
    },
    senha: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    dataCriacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    dataAtualizacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    comissao: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'representantes',
    timestamps: true,
});
// Hook para atualizar dataAtualizacao
Representante.beforeUpdate((representante) => {
    representante.dataAtualizacao = new Date();
});
exports.default = Representante;

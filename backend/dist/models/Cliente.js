"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cliente = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Cliente extends sequelize_1.Model {
}
exports.Cliente = Cliente;
Cliente.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    razaoSocial: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    nomeFantasia: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cnpj: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    inscricaoEstadual: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    telefone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    celular: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    endereco: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ativo',
    },
    representantes: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    usuario: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'clientes',
    timestamps: true,
});
exports.default = Cliente;

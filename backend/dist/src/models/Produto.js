"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Produto extends sequelize_1.Model {
}
exports.Produto = Produto;
Produto.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    codigo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    imagem: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    especificacoes: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    preco: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    precoAVista: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    precoAPrazo: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    pesoPorMetro: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    estoque: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    categoria: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    tags: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    dataCadastro: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ativo',
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'produtos',
    timestamps: false,
});
exports.default = Produto;

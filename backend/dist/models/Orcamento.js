"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orcamento = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Orcamento extends sequelize_1.Model {
}
exports.Orcamento = Orcamento;
Orcamento.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    clienteId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'clientes',
            key: 'id'
        }
    },
    representanteId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'representantes',
            key: 'id'
        }
    },
    produtoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'produtos',
            key: 'id'
        }
    },
    quantidade: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    observacao: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pendente', 'respondido'),
        allowNull: false,
        defaultValue: 'pendente',
    },
    dataSolicitacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'orcamentos',
    timestamps: true,
});
exports.default = Orcamento;

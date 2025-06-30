"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovimentacaoEstoque = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class MovimentacaoEstoque extends sequelize_1.Model {
}
exports.MovimentacaoEstoque = MovimentacaoEstoque;
MovimentacaoEstoque.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    produtoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'produtos',
            key: 'id'
        }
    },
    tipo: {
        type: sequelize_1.DataTypes.ENUM('entrada', 'saida'),
        allowNull: false,
    },
    quantidade: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    data: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    usuario: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    observacao: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'movimentacoes_estoque',
    timestamps: true,
});
exports.default = MovimentacaoEstoque;

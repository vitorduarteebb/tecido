"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pedido = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Pedido extends sequelize_1.Model {
}
exports.Pedido = Pedido;
Pedido.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    numeroPedido: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    itens: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    valorTotal: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    condicaoPagamento: {
        type: sequelize_1.DataTypes.ENUM('avista', 'aprazo'),
        allowNull: false,
    },
    detalhePrazo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    pesoTotal: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('Em Separação', 'Faturado', 'Enviado', 'Aguardando Estoque'),
        allowNull: false,
        defaultValue: 'Em Separação',
    },
    data: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    observacoes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    comissaoPaga: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    dataComissaoPaga: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    dataFaturamento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    historicoAlteracoes: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
}, {
    sequelize: database_1.sequelize,
    tableName: 'pedidos',
    timestamps: true,
});
// Hook para gerar número do pedido
Pedido.beforeCreate(async (pedido) => {
    if (!pedido.numeroPedido) {
        try {
            // Busca o último pedido para pegar o próximo número
            const ultimoPedido = await Pedido.findOne({
                order: [['numeroPedido', 'DESC']]
            });
            let proximoNumero = 1;
            if (ultimoPedido && ultimoPedido.numeroPedido) {
                // Extrai o número do último pedido (formato: PED-2024-0001)
                const match = ultimoPedido.numeroPedido.match(/PED-(\d{4})-(\d{4})/);
                if (match) {
                    const ano = parseInt(match[1]);
                    const numero = parseInt(match[2]);
                    const anoAtual = new Date().getFullYear();
                    if (ano === anoAtual) {
                        proximoNumero = numero + 1;
                    }
                }
            }
            const anoAtual = new Date().getFullYear();
            pedido.numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
        }
        catch (error) {
            console.error('Erro ao gerar número do pedido:', error);
            // Fallback: usar timestamp se houver erro
            pedido.numeroPedido = `PED-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        }
    }
});
exports.default = Pedido;

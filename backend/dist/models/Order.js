"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDENTE"] = "pendente";
    OrderStatus["APROVADO"] = "aprovado";
    OrderStatus["REJEITADO"] = "rejeitado";
    OrderStatus["CANCELADO"] = "cancelado";
    OrderStatus["EM_PRODUCAO"] = "em_producao";
    OrderStatus["ENVIADO"] = "enviado";
    OrderStatus["ENTREGUE"] = "entregue";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
const OrderSchema = new mongoose_1.Schema({
    numero: {
        type: String,
        required: [true, 'Número do pedido é obrigatório'],
        unique: true,
        trim: true
    },
    cliente: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Cliente é obrigatório']
    },
    representante: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Representante é obrigatório']
    },
    itens: [{
            produto: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Produto é obrigatório']
            },
            quantidade: {
                type: Number,
                required: [true, 'Quantidade é obrigatória'],
                min: [1, 'Quantidade deve ser maior que zero']
            },
            precoUnitario: {
                type: Number,
                required: [true, 'Preço unitário é obrigatório'],
                min: [0, 'Preço unitário não pode ser negativo']
            },
            total: {
                type: Number,
                required: [true, 'Total é obrigatório'],
                min: [0, 'Total não pode ser negativo']
            }
        }],
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        default: OrderStatus.PENDENTE,
        required: [true, 'Status é obrigatório']
    },
    valorTotal: {
        type: Number,
        required: [true, 'Valor total é obrigatório'],
        min: [0, 'Valor total não pode ser negativo']
    },
    observacoes: {
        type: String,
        trim: true
    },
    comprovantePagamento: {
        type: String,
        trim: true
    },
    notaFiscal: {
        type: String,
        trim: true
    },
    dataPedido: {
        type: Date,
        required: [true, 'Data do pedido é obrigatória'],
        default: Date.now
    },
    dataAprovacao: {
        type: Date
    },
    dataEnvio: {
        type: Date
    },
    dataEntrega: {
        type: Date
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'dataCriacao',
        updatedAt: 'dataAtualizacao'
    }
});
// Middleware para calcular o valor total antes de salvar
OrderSchema.pre('save', function (next) {
    if (this.isModified('itens')) {
        this.valorTotal = this.itens.reduce((total, item) => total + item.total, 0);
    }
    next();
});
// Índices para melhorar a performance das buscas
OrderSchema.index({ numero: 1 });
OrderSchema.index({ cliente: 1 });
OrderSchema.index({ representante: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ dataPedido: -1 });
exports.default = mongoose_1.default.model('Order', OrderSchema);

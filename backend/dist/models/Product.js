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
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    codigo: {
        type: String,
        required: [true, 'Código do produto é obrigatório'],
        unique: true,
        trim: true
    },
    nome: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        required: [true, 'Descrição do produto é obrigatória'],
        trim: true
    },
    categoria: {
        type: String,
        required: [true, 'Categoria do produto é obrigatória'],
        trim: true
    },
    precoUnitario: {
        type: Number,
        required: [true, 'Preço unitário é obrigatório'],
        min: [0, 'Preço unitário não pode ser negativo']
    },
    quantidadeEstoque: {
        type: Number,
        required: [true, 'Quantidade em estoque é obrigatória'],
        min: [0, 'Quantidade em estoque não pode ser negativa'],
        default: 0
    },
    imagens: [{
            type: String,
            trim: true
        }],
    ativo: {
        type: Boolean,
        default: true
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
// Índices para melhorar a performance das buscas
ProductSchema.index({ codigo: 1 });
ProductSchema.index({ nome: 'text', descricao: 'text' });
ProductSchema.index({ categoria: 1 });
ProductSchema.index({ ativo: 1 });
exports.default = mongoose_1.default.model('Product', ProductSchema);

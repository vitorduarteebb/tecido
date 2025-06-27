"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const representanteSchema = new mongoose_1.default.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    telefone: {
        type: String,
        required: true,
        trim: true
    },
    regiao: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
    },
    senha: {
        type: String,
        required: true,
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now,
    },
    comissao: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
});
// Middleware para atualizar a data de atualização
representanteSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.dataAtualizacao = new Date();
    }
    next();
});
const Representante = mongoose_1.default.model('Representante', representanteSchema);
exports.default = Representante;
// Observação: A relação de clientes vinculados é feita pelo campo 'representantes' no model Cliente. 

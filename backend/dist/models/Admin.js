"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const types_1 = require("../types");
const adminSchema = new mongoose_1.default.Schema({
    nome: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    senha: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(types_1.UserRole),
        default: types_1.UserRole.ADMINISTRADOR,
        required: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now,
    },
});
// Middleware para atualizar a data de atualização
adminSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.dataAtualizacao = new Date();
    }
    next();
});
const Admin = mongoose_1.default.model('Admin', adminSchema);
exports.default = Admin;

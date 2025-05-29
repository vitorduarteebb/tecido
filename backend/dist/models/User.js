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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config/config");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["REPRESENTANTE"] = "representante";
    UserRole["CLIENTE"] = "cliente";
})(UserRole || (exports.UserRole = UserRole = {}));
const UserSchema = new mongoose_1.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: [true, 'Tipo de usuário é obrigatório']
    },
    cpfCnpj: {
        type: String,
        required: [true, 'CPF/CNPJ é obrigatório'],
        unique: true,
        trim: true
    },
    telefone: {
        type: String,
        required: [true, 'Telefone é obrigatório'],
        trim: true
    },
    endereco: {
        rua: {
            type: String,
            required: [true, 'Rua é obrigatória']
        },
        numero: {
            type: String,
            required: [true, 'Número é obrigatório']
        },
        complemento: String,
        bairro: {
            type: String,
            required: [true, 'Bairro é obrigatório']
        },
        cidade: {
            type: String,
            required: [true, 'Cidade é obrigatória']
        },
        estado: {
            type: String,
            required: [true, 'Estado é obrigatório']
        },
        cep: {
            type: String,
            required: [true, 'CEP é obrigatório']
        }
    },
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
// Hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('senha'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(config_1.config.bcryptSaltRounds);
        this.senha = await bcryptjs_1.default.hash(this.senha, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Método para comparar senhas
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        if (!this.senha || !candidatePassword) {
            return false;
        }
        return await bcryptjs_1.default.compare(candidatePassword, this.senha);
    }
    catch (error) {
        console.error('Erro ao comparar senhas:', error);
        return false;
    }
};
// Índices para melhorar a performance das buscas
UserSchema.index({ email: 1 });
UserSchema.index({ cpfCnpj: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ ativo: 1 });
exports.default = mongoose_1.default.model('User', UserSchema);

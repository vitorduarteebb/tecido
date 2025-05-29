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
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importStar(require("../models/User"));
const config_1 = require("../config/config");
const createAdminUser = async () => {
    try {
        // Conecta ao MongoDB
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Conectado ao MongoDB');
        // Verifica se já existe um admin
        const adminExists = await User_1.default.findOne({ role: User_1.UserRole.ADMIN });
        if (adminExists) {
            console.log('Usuário admin já existe');
            process.exit(0);
        }
        // Cria o usuário admin
        const adminUser = new User_1.default({
            nome: 'Administrador',
            email: 'admin@tecidos.com',
            senha: 'Admin@123',
            role: User_1.UserRole.ADMIN,
            cpfCnpj: '00000000000',
            telefone: '0000000000',
            endereco: {
                rua: 'Rua Admin',
                numero: '1',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '00000000'
            },
            ativo: true
        });
        await adminUser.save();
        console.log('Usuário admin criado com sucesso');
        console.log('Email: admin@tecidos.com');
        console.log('Senha: Admin@123');
    }
    catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
};
createAdminUser();

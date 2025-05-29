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
exports.updatePassword = exports.deactivateUser = exports.updateUser = exports.getUserById = exports.listUsers = exports.login = exports.register = void 0;
const User_1 = __importStar(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
// Registrar novo usuário
const register = async (req, res) => {
    try {
        const { email, cpfCnpj } = req.body;
        // Verifica se já existe usuário com o mesmo email ou CPF/CNPJ
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { cpfCnpj }]
        });
        if (existingUser) {
            res.status(400).json({
                message: 'Já existe um usuário com este email ou CPF/CNPJ'
            });
            return;
        }
        const user = await User_1.default.create(req.body);
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
};
exports.register = register;
// Login
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = await User_1.default.findOne({ email }).exec();
        if (!user) {
            res.status(401).json({
                message: 'Email ou senha inválidos'
            });
            return;
        }
        if (!user.ativo) {
            res.status(401).json({
                message: 'Usuário desativado'
            });
            return;
        }
        const isMatch = await user.comparePassword(senha);
        if (!isMatch) {
            res.status(401).json({
                message: 'Email ou senha inválidos'
            });
            return;
        }
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        res.json({
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
};
exports.login = login;
// Listar usuários
const listUsers = async (req, res) => {
    try {
        const { role, ativo, search } = req.query;
        const query = {};
        if (role)
            query.role = role;
        if (ativo !== undefined)
            query.ativo = ativo === 'true';
        if (search) {
            query.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { cpfCnpj: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User_1.default.find(query)
            .select('-senha')
            .sort({ dataCriacao: -1 });
        res.json(users);
    }
    catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro ao listar usuários' });
    }
};
exports.listUsers = listUsers;
// Buscar usuário por ID
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-senha');
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        // Verifica se o usuário tem permissão para ver o perfil
        if (req.userRole !== User_1.UserRole.ADMIN && user._id.toString() !== req.userId) {
            res.status(403).json({ message: 'Acesso não autorizado' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
};
exports.getUserById = getUserById;
// Atualizar usuário
const updateUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        // Verifica se o usuário tem permissão para atualizar o perfil
        if (req.userRole !== User_1.UserRole.ADMIN && user._id.toString() !== req.userId) {
            res.status(403).json({ message: 'Acesso não autorizado' });
            return;
        }
        // Não permite alterar o próprio role
        if (user._id.toString() === req.userId && req.body.role) {
            delete req.body.role;
        }
        // Remove campos que não podem ser atualizados
        delete req.body.senha;
        delete req.body.email;
        delete req.body.cpfCnpj;
        Object.assign(user, req.body);
        await user.save();
        res.json({
            message: 'Usuário atualizado com sucesso',
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
};
exports.updateUser = updateUser;
// Desativar usuário
const deactivateUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        // Não permite desativar o próprio usuário
        if (user._id.toString() === req.userId) {
            res.status(400).json({
                message: 'Não é possível desativar o próprio usuário'
            });
            return;
        }
        user.ativo = false;
        await user.save();
        res.json({
            message: 'Usuário desativado com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao desativar usuário:', error);
        res.status(500).json({ message: 'Erro ao desativar usuário' });
    }
};
exports.deactivateUser = deactivateUser;
// Atualizar senha
const updatePassword = async (req, res) => {
    try {
        const { senhaAtual, novaSenha } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        // Verifica se o usuário tem permissão para alterar a senha
        if (user._id.toString() !== req.userId) {
            res.status(403).json({ message: 'Acesso não autorizado' });
            return;
        }
        // Verifica se a senha atual está correta
        const isMatch = await user.comparePassword(senhaAtual);
        if (!isMatch) {
            res.status(401).json({
                message: 'Senha atual incorreta'
            });
            return;
        }
        user.senha = novaSenha;
        await user.save();
        res.json({
            message: 'Senha atualizada com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
};
exports.updatePassword = updatePassword;

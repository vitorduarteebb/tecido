"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { email } = req.body;
        // Verifica se o usuário já existe
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
        // Cria o novo usuário
        const user = new User_1.default(req.body);
        await user.save();
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // Remove a senha do objeto de resposta
        const userResponse = user.toObject();
        const { senha: _, ...userWithoutPassword } = userResponse;
        res.status(201).json({
            message: 'Usuário cadastrado com sucesso',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        console.log('Tentativa de login - Dados recebidos:', {
            ...req.body,
            senha: '[REDACTED]'
        });
        const { email, senha } = req.body;
        // Verifica se o usuário existe
        const user = await User_1.default.findOne({ email });
        console.log('Usuário encontrado:', user ? 'Sim' : 'Não');
        if (!user) {
            console.log('Login falhou: Usuário não encontrado');
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        // Verifica se o usuário está ativo
        console.log('Usuário ativo:', user.ativo);
        if (!user.ativo) {
            console.log('Login falhou: Usuário inativo');
            return res.status(401).json({ message: 'Usuário inativo' });
        }
        // Verifica a senha
        const isMatch = await user.comparePassword(senha);
        console.log('Senha corresponde:', isMatch);
        if (!isMatch) {
            console.log('Login falhou: Senha incorreta');
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'sua_chave_secreta_aqui', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        // Remove a senha do objeto de resposta
        const userResponse = user.toObject();
        const { senha: _, ...userWithoutPassword } = userResponse;
        console.log('Login bem-sucedido. Dados do usuário:', {
            ...userWithoutPassword,
            token: token.substring(0, 10) + '...'
        });
        res.json({
            message: 'Login realizado com sucesso',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Erro ao realizar login:', error);
        res.status(500).json({ message: 'Erro ao realizar login' });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select('-senha');
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
};
exports.me = me;

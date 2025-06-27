"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const Admin_1 = __importDefault(require("../models/Admin"));
const Representante_1 = __importDefault(require("../models/Representante"));
const Cliente_1 = require("../models/Cliente");
const Usuario_1 = require("../models/Usuario");
const VALID_ROLES = ['ADMINISTRADOR', 'REPRESENTANTE', 'CLIENTE'];
exports.authController = {
    login: async (req, res) => {
        try {
            const { email, senha, role } = req.body;
            console.log('Login attempt:', { email, role });
            // Verifica se todos os campos necessários foram fornecidos
            if (!email || !senha || !role) {
                console.log('Missing required fields:', { email: !!email, senha: !!senha, role: !!role });
                return res.status(400).json({
                    message: 'Email, senha e role são obrigatórios'
                });
            }
            // Normaliza a role para maiúsculas
            const normalizedRole = role.toUpperCase();
            console.log('Normalized role:', normalizedRole);
            // Valida se a role é válida
            if (!VALID_ROLES.includes(normalizedRole)) {
                console.log('Invalid role:', normalizedRole);
                return res.status(400).json({
                    message: 'Role inválida',
                    validRoles: VALID_ROLES
                });
            }
            // Seleciona o modelo correto baseado na role
            let UserModel;
            let user = null;
            let userResponse = null;
            let token = '';
            switch (normalizedRole) {
                case 'ADMINISTRADOR':
                    UserModel = Admin_1.default;
                    user = await UserModel.findOne({ email }).exec();
                    if (!user) {
                        console.log('User not found:', email);
                        return res.status(401).json({
                            message: 'Credenciais inválidas'
                        });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, user.senha)) {
                        console.log('Invalid password for user:', email);
                        return res.status(401).json({
                            message: 'Credenciais inválidas'
                        });
                    }
                    token = jsonwebtoken_1.default.sign({ id: user._id, role: normalizedRole }, database_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = user.toObject();
                    delete userResponse.senha;
                    break;
                case 'REPRESENTANTE':
                    UserModel = Representante_1.default;
                    user = await UserModel.findOne({ email }).exec();
                    if (!user) {
                        console.log('User not found:', email);
                        return res.status(401).json({
                            message: 'Credenciais inválidas'
                        });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, user.senha)) {
                        console.log('Invalid password for user:', email);
                        return res.status(401).json({
                            message: 'Credenciais inválidas'
                        });
                    }
                    token = jsonwebtoken_1.default.sign({ id: user._id, role: normalizedRole }, database_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = user.toObject();
                    delete userResponse.senha;
                    // Adiciona o id do representante como id e o id do usuário como userId (caso queira usar no futuro)
                    userResponse.id = user._id;
                    userResponse.userId = user._id; // Não há usuário separado para representante, então ambos são iguais
                    break;
                case 'CLIENTE':
                    // Busca o usuário pelo email e role CLIENTE
                    const usuario = await Usuario_1.Usuario.findOne({ email, role: 'CLIENTE' });
                    if (!usuario) {
                        console.log('Cliente user not found:', email);
                        return res.status(401).json({ message: 'Credenciais inválidas' });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, usuario.senha)) {
                        console.log('Invalid password for cliente user:', email);
                        return res.status(401).json({ message: 'Credenciais inválidas' });
                    }
                    // Busca o cliente associado ao usuário
                    const cliente = await Cliente_1.Cliente.findOne({ usuario: usuario._id });
                    if (!cliente) {
                        console.log('Cliente not found for user:', email);
                        return res.status(401).json({ message: 'Cliente não encontrado' });
                    }
                    token = jsonwebtoken_1.default.sign({ id: usuario._id, role: normalizedRole }, database_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = usuario.toObject();
                    delete userResponse.senha;
                    // Adiciona o id do cliente ao retorno
                    userResponse.clienteId = cliente._id;
                    break;
                default:
                    console.log('Invalid role after validation (should not happen):', normalizedRole);
                    return res.status(400).json({
                        message: 'Role inválida'
                    });
            }
            console.log('Login successful:', { email, role: normalizedRole });
            // Retorna o token e os dados do usuário
            res.json({
                token,
                user: Object.assign(Object.assign({}, userResponse), { role: normalizedRole })
            });
        }
        catch (error) {
            console.error('Erro detalhado no login:', error);
            res.status(500).json({
                message: 'Erro ao realizar login',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }
};

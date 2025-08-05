"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const models_1 = require("../models");
const VALID_ROLES = ['ADMINISTRADOR', 'REPRESENTANTE', 'CLIENTE'];
exports.authController = {
    login: async (req, res) => {
        try {
            const { email, senha, role } = req.body;
            console.log('Login attempt:', { email, role });
            // Verifica se todos os campos necessarios foram fornecidos
            if (!email || !senha || !role) {
                console.log('Missing required fields:', { email: !!email, senha: !!senha, role: !!role });
                return res.status(400).json({
                    message: 'Email, senha e role sao obrigatorios'
                });
            }
            // Normaliza a role para maiusculas
            const normalizedRole = role.toUpperCase();
            console.log('Normalized role:', normalizedRole);
            // Valida se a role e valida
            if (!VALID_ROLES.includes(normalizedRole)) {
                console.log('Invalid role:', normalizedRole);
                return res.status(400).json({
                    message: 'Role invalida',
                    validRoles: VALID_ROLES
                });
            }
            // Seleciona o modelo correto baseado na role
            let user = null;
            let userResponse = null;
            let token = '';
            switch (normalizedRole) {
                case 'ADMINISTRADOR':
                    user = await models_1.Admin.findOne({ where: { email } });
                    if (!user) {
                        console.log('User not found:', email);
                        return res.status(401).json({
                            message: 'Credenciais invalidas'
                        });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, user.senha)) {
                        console.log('Invalid password for user:', email);
                        return res.status(401).json({
                            message: 'Credenciais invalidas'
                        });
                    }
                    token = jsonwebtoken_1.default.sign({ id: user.id, role: normalizedRole }, config_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = user.toJSON();
                    delete userResponse.senha;
                    break;
                case 'REPRESENTANTE':
                    user = await models_1.Representante.findOne({ where: { email } });
                    if (!user) {
                        console.log('User not found:', email);
                        return res.status(401).json({
                            message: 'Credenciais invalidas'
                        });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, user.senha)) {
                        console.log('Invalid password for user:', email);
                        return res.status(401).json({
                            message: 'Credenciais invalidas'
                        });
                    }
                    token = jsonwebtoken_1.default.sign({ id: user.id, role: normalizedRole }, config_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = user.toJSON();
                    delete userResponse.senha;
                    // Adiciona o id do representante como id e o id do usuario como userId (caso queira usar no futuro)
                    userResponse.id = user.id;
                    userResponse.userId = user.id; // Nao ha usuario separado para representante, entao ambos sao iguais
                    break;
                case 'CLIENTE':
                    // Busca o usuario pelo email e role CLIENTE
                    const usuario = await models_1.Usuario.findOne({ where: { email, role: 'CLIENTE' } });
                    if (!usuario) {
                        console.log('Cliente user not found:', email);
                        return res.status(401).json({ message: 'Credenciais invalidas' });
                    }
                    // Verifica a senha
                    if (!await bcryptjs_1.default.compare(senha, usuario.senha)) {
                        console.log('Invalid password for cliente user:', email);
                        return res.status(401).json({ message: 'Credenciais invalidas' });
                    }
                    // Busca o cliente associado ao usuario
                    const cliente = await models_1.Cliente.findOne({ where: { usuario: usuario.id } });
                    if (!cliente) {
                        console.log('Cliente not found for user:', email);
                        return res.status(401).json({ message: 'Cliente nao encontrado' });
                    }
                    token = jsonwebtoken_1.default.sign({ id: usuario.id, role: normalizedRole }, config_1.config.jwtSecret, { expiresIn: '24h' });
                    userResponse = usuario.toJSON();
                    delete userResponse.senha;
                    // Adiciona o id do cliente ao retorno
                    userResponse.clienteId = cliente.id;
                    break;
                default:
                    console.log('Invalid role after validation (should not happen):', normalizedRole);
                    return res.status(400).json({
                        message: 'Role invalida'
                    });
            }
            console.log('Login successful:', { email, role: normalizedRole });
            // Retorna o token e os dados do usuario
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

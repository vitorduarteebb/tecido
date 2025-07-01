"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const types_1 = require("../types");
const Cliente_1 = require("../models/Cliente");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('[authMiddleware] URL da requisição:', req.url);
        console.log('[authMiddleware] Método da requisição:', req.method);
        console.log('[authMiddleware] Header Authorization recebido:', authHeader);
        if (!authHeader) {
            console.log('[authMiddleware] Token não fornecido');
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const [, token] = authHeader.split(' ');
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            if (decoded.role === types_1.UserRole.CLIENTE) {
                // Busca o cliente pelo campo usuario
                const cliente = await Cliente_1.Cliente.findOne({ where: { usuario: decoded.id } });
                if (!cliente) {
                    return res.status(401).json({ message: 'Usuário não encontrado' });
                }
                req.userId = String(cliente.id);
                req.userRole = decoded.role;
                req.user = {
                    id: String(cliente.id),
                    role: types_1.UserRole.CLIENTE
                };
                return next();
            }
            // Para outros roles, apenas seguir
            req.userId = decoded.id;
            req.userRole = decoded.role;
            req.user = {
                id: decoded.id,
                role: decoded.role
            };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ message: 'Token inválido ou expirado' });
            }
            throw error;
        }
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.authMiddleware = authMiddleware;

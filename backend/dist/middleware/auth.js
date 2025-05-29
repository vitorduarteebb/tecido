"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                message: 'Token de autenticação não fornecido'
            });
            return;
        }
        const [, token] = authHeader.split(' ');
        if (!token) {
            res.status(401).json({
                message: 'Token de autenticação inválido'
            });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            req.userId = decoded.userId;
            req.userRole = decoded.role;
            next();
        }
        catch (error) {
            res.status(401).json({
                message: 'Token de autenticação inválido'
            });
            return;
        }
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        res.status(500).json({
            message: 'Erro interno do servidor'
        });
        return;
    }
};
exports.authenticate = authenticate;
const checkRole = (roles) => {
    return async (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                message: 'Acesso negado. Você não tem permissão para acessar este recurso'
            });
        }
        next();
    };
};
exports.checkRole = checkRole;

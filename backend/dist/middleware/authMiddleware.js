"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const [, token] = authHeader.split(' ');
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            req.userId = decoded.id;
            req.userRole = decoded.role;
            return next();
        }
        catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.authMiddleware = authMiddleware;

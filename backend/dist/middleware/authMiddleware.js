"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const types_1 = require("../types");
const Admin_1 = __importDefault(require("../models/Admin"));
const Representante_1 = __importDefault(require("../models/Representante"));
const Cliente_1 = require("../models/Cliente");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('[authMiddleware] Header Authorization recebido:', authHeader);
        if (!authHeader) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        const [, token] = authHeader.split(' ');
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
            // Seleciona o modelo correto baseado na role
            let UserModel;
            if (decoded.role === types_1.UserRole.CLIENTE) {
                // Busca o cliente pelo campo usuario
                const cliente = await Cliente_1.Cliente.findOne({ usuario: decoded.id }).exec();
                if (!cliente) {
                    return res.status(401).json({ message: 'Usuário não encontrado' });
                }
                req.userId = cliente._id.toString();
                req.userRole = decoded.role;
                req.user = {
                    id: cliente._id.toString(),
                    role: types_1.UserRole.CLIENTE
                };
                return next();
            }
            else {
                switch (decoded.role) {
                    case types_1.UserRole.ADMINISTRADOR:
                        UserModel = Admin_1.default;
                        break;
                    case types_1.UserRole.REPRESENTANTE:
                        UserModel = Representante_1.default;
                        break;
                    default:
                        return res.status(401).json({ message: 'Role inválida no token' });
                }
                // Verifica se o usuário ainda existe no banco
                const user = await UserModel.findById(decoded.id).exec();
                if (!user) {
                    return res.status(401).json({ message: 'Usuário não encontrado' });
                }
                req.userId = decoded.id;
                req.userRole = decoded.role;
                req.user = {
                    id: decoded.id,
                    role: decoded.role
                };
                return next();
            }
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

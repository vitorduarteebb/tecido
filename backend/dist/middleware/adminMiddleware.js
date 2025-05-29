"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const types_1 = require("../types");
const adminMiddleware = (req, res, next) => {
    try {
        if (req.userRole !== types_1.UserRole.ADMIN) {
            return res.status(403).json({
                message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
            });
        }
        next();
    }
    catch (error) {
        console.error('Erro no middleware de admin:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.adminMiddleware = adminMiddleware;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.representanteMiddleware = void 0;
const types_1 = require("../types");
const representanteMiddleware = (req, res, next) => {
    try {
        console.log('[representanteMiddleware] Verificando se usuário é representante');
        console.log('[representanteMiddleware] Role do usuário:', req.userRole);
        console.log('[representanteMiddleware] Usuário:', req.user);
        if (!req.user) {
            console.log('[representanteMiddleware] Usuário não autenticado');
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }
        if (req.userRole !== types_1.UserRole.REPRESENTANTE && req.userRole !== types_1.UserRole.ADMINISTRADOR) {
            console.log('[representanteMiddleware] Usuário não tem permissão (não é representante nem admin)');
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas representantes e administradores podem acessar este recurso.'
            });
        }
        console.log('[representanteMiddleware] Acesso permitido');
        next();
    }
    catch (error) {
        console.error('[representanteMiddleware] Erro:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};
exports.representanteMiddleware = representanteMiddleware;

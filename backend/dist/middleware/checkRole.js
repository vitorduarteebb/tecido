"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userRole = req.userRole;
            if (!userRole || !allowedRoles.includes(userRole)) {
                res.status(403).json({
                    message: 'Acesso não autorizado'
                });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Erro na verificação de permissões:', error);
            res.status(500).json({
                message: 'Erro interno do servidor'
            });
            return;
        }
    };
};
exports.checkRole = checkRole;

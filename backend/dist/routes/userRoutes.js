"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const checkRole_1 = require("../middleware/checkRole");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Rotas públicas
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);
// Rotas protegidas - requer autenticação
router.use('/users', auth_1.authenticate);
// Listar usuários (apenas admin)
router.get('/users', (0, checkRole_1.checkRole)([User_1.UserRole.ADMIN]), userController.listUsers);
// Buscar usuário por ID (admin pode ver todos, outros só podem ver próprio perfil)
router.get('/users/:id', userController.getUserById);
// Atualizar usuário (admin pode atualizar todos, outros só podem atualizar próprio perfil)
router.put('/users/:id', userController.updateUser);
// Desativar usuário (apenas admin)
router.delete('/users/:id', (0, checkRole_1.checkRole)([User_1.UserRole.ADMIN]), userController.deactivateUser);
// Atualizar senha
router.patch('/users/:id/password', userController.updatePassword);
exports.default = router;

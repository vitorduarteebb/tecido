"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clienteController_1 = require("../controllers/clienteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const representanteMiddleware_1 = require("../middleware/representanteMiddleware");
const router = express_1.default.Router();
// Rotas protegidas por autenticação
router.use(authMiddleware_1.authMiddleware);
// Rotas públicas (acessíveis por qualquer usuário autenticado)
router.get('/', clienteController_1.clienteController.listar);
router.get('/:id', clienteController_1.clienteController.obter);
// Rotas para criar clientes (representantes e admins)
router.post('/', representanteMiddleware_1.representanteMiddleware, clienteController_1.clienteController.criar);
// Rotas protegidas (apenas admin)
router.use(adminMiddleware_1.adminMiddleware);
router.put('/:id', clienteController_1.clienteController.atualizar);
router.delete('/:id', clienteController_1.clienteController.excluir);
router.patch('/:id/status', clienteController_1.clienteController.alterarStatus);
router.patch('/:id/reset-senha', clienteController_1.clienteController.resetarSenha);
exports.default = router;

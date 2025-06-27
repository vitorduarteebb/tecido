"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const representanteController_1 = require("../controllers/representanteController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = express_1.default.Router();
// Rotas protegidas por autenticação e restritas a administradores
router.use(authMiddleware_1.authMiddleware);
router.use(adminMiddleware_1.adminMiddleware);
// Rotas CRUD
router.get('/', representanteController_1.representanteController.listar);
router.get('/:id', representanteController_1.representanteController.obter);
router.post('/', representanteController_1.representanteController.criar);
router.put('/:id', representanteController_1.representanteController.atualizar);
router.delete('/:id', representanteController_1.representanteController.excluir);
router.patch('/:id/status', representanteController_1.representanteController.alterarStatus);
router.get('/:id/clientes', representanteController_1.representanteController.listarClientes);
router.post('/:id/clientes', representanteController_1.representanteController.vincularClientes);
router.delete('/:id/clientes/:clienteId', representanteController_1.representanteController.desvincularCliente);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orcamentoController_1 = require("../controllers/orcamentoController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Cliente solicita orçamento
router.post('/solicitar', authMiddleware_1.authMiddleware, orcamentoController_1.orcamentoController.solicitar);
// Representante lista orçamentos recebidos
router.get('/representante', authMiddleware_1.authMiddleware, orcamentoController_1.orcamentoController.listarPorRepresentante);
// Atualizar status do orçamento
router.patch('/:id/status', authMiddleware_1.authMiddleware, orcamentoController_1.orcamentoController.atualizarStatus);
exports.default = router;

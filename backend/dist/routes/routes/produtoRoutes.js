"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const produtoController_1 = require("../controllers/produtoController");
const movimentacaoEstoqueRoutes_1 = __importDefault(require("./movimentacaoEstoqueRoutes"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware_1.authMiddleware);
router.get('/', produtoController_1.produtoController.listar);
router.get('/:id', produtoController_1.produtoController.obter);
router.post('/', produtoController_1.produtoController.criar);
router.put('/:id', produtoController_1.produtoController.atualizar);
router.delete('/:id', produtoController_1.produtoController.excluir);
router.use('/:id/movimentacoes', movimentacaoEstoqueRoutes_1.default);
exports.default = router;

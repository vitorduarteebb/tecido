"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const movimentacaoEstoqueController_1 = require("../controllers/movimentacaoEstoqueController");
const router = express_1.default.Router({ mergeParams: true });
router.post('/', movimentacaoEstoqueController_1.movimentacaoEstoqueController.registrar);
router.get('/', movimentacaoEstoqueController_1.movimentacaoEstoqueController.listar);
exports.default = router;

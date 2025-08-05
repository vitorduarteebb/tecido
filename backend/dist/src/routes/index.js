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
const path_1 = __importDefault(require("path"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const representanteRoutes_1 = __importDefault(require("./representanteRoutes"));
const clienteRoutes_1 = __importDefault(require("./clienteRoutes"));
const produtoRoutes_1 = __importDefault(require("./produtoRoutes"));
const uploadRoutes_1 = __importDefault(require("./uploadRoutes"));
const pedidoRoutes_1 = __importDefault(require("./pedidoRoutes"));
const orcamentoRoutes_1 = __importDefault(require("./orcamentoRoutes"));
const importRoutes_1 = __importDefault(require("./importRoutes"));
const relatorioController = __importStar(require("../controllers/relatorioController"));
const router = express_1.default.Router();
// Rotas de autenticação
router.use('/auth', authRoutes_1.default);
// Rotas de representantes
router.use('/representantes', representanteRoutes_1.default);
// Rotas de clientes
router.use('/clientes', clienteRoutes_1.default);
// Rotas de produtos
router.use('/produtos', produtoRoutes_1.default);
// Rota de upload de imagens
router.use('/upload', uploadRoutes_1.default);
// Rotas de pedidos
router.use('/pedidos', pedidoRoutes_1.default);
// Rotas de orçamentos
router.use('/orcamentos', orcamentoRoutes_1.default);
// Rotas de importação
router.use('/import', importRoutes_1.default);
// Relatórios
router.get('/relatorios/vendas-representante-mes', relatorioController.vendasPorRepresentanteMes);
router.get('/relatorios/vendas-produto-representante', relatorioController.vendasPorPeriodoProdutoRepresentante);
router.get('/relatorios/clientes-ranking', relatorioController.rankingClientes);
// Rota para download do template de produtos
router.get('/template-produtos', (req, res) => {
    const templatePath = path_1.default.join(__dirname, '../../template_produtos.xlsx');
    res.download(templatePath, 'template_produtos.xlsx', (err) => {
        if (err) {
            res.status(404).json({ error: 'Template não encontrado' });
        }
    });
});
exports.default = router;

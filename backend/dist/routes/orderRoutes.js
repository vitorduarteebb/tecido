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
const orderController = __importStar(require("../controllers/orderController"));
const auth_1 = require("../middleware/auth");
const checkRole_1 = require("../middleware/checkRole");
const multer_1 = require("../config/multer");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Rotas protegidas - requer autenticação
router.use(auth_1.authenticate);
// Listar pedidos (todos os usuários autenticados podem listar, mas os resultados são filtrados por role)
router.get('/orders', orderController.listOrders);
// Buscar pedido por ID (todos os usuários autenticados podem buscar, mas a visibilidade é controlada no controller)
router.get('/orders/:id', orderController.getOrderById);
// Criar pedido (apenas representantes)
router.post('/orders', (0, checkRole_1.checkRole)([User_1.UserRole.REPRESENTANTE]), orderController.createOrder);
// Atualizar status do pedido (apenas admin)
router.patch('/orders/:id/status', (0, checkRole_1.checkRole)([User_1.UserRole.ADMIN]), orderController.updateOrderStatus);
// Anexar comprovante de pagamento (apenas clientes)
router.post('/orders/:id/payment-proof', (0, checkRole_1.checkRole)([User_1.UserRole.CLIENTE]), multer_1.upload.single('comprovante'), orderController.attachPaymentProof);
// Anexar nota fiscal (apenas admin)
router.post('/orders/:id/invoice', (0, checkRole_1.checkRole)([User_1.UserRole.ADMIN]), multer_1.upload.single('notaFiscal'), orderController.attachInvoice);
exports.default = router;

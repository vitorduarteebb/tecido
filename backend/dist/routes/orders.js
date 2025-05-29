"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const orderController_1 = require("../controllers/orderController");
// Configuração do Multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não suportado'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
const router = express_1.default.Router();
// Rotas protegidas por autenticação
router.use(auth_1.auth);
// Criar pedido (apenas representantes)
router.post('/', (0, auth_1.checkRole)(['representante']), orderController_1.createOrder);
// Listar pedidos (todos os usuários autenticados)
router.get('/', orderController_1.listOrders);
// Buscar pedido por ID (todos os usuários autenticados)
router.get('/:id', orderController_1.getOrderById);
// Atualizar status do pedido (admin e representantes)
router.patch('/:id/status', (0, auth_1.checkRole)(['admin', 'representante']), orderController_1.updateOrderStatus);
// Anexar documentos ao pedido (admin e representantes)
router.post('/:id/documentos', (0, auth_1.checkRole)(['admin', 'representante']), upload.single('arquivo'), orderController_1.attachDocument);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const importController_1 = require("../controllers/importController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const representanteMiddleware_1 = require("../middleware/representanteMiddleware");
const router = (0, express_1.Router)();
// Configurar multer para upload de arquivos
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'application/octet-stream') {
            cb(null, true);
        }
        else {
            cb(new Error('Apenas arquivos Excel são permitidos'));
        }
    }
});
// Rota para importar clientes (representantes e admins)
router.post('/clientes', authMiddleware_1.authMiddleware, representanteMiddleware_1.representanteMiddleware, upload.single('file'), importController_1.importClientes);
// Rota para importar produtos (apenas admins)
router.post('/produtos', authMiddleware_1.authMiddleware, adminMiddleware_1.adminMiddleware, upload.single('file'), importController_1.importProdutos);
exports.default = router;

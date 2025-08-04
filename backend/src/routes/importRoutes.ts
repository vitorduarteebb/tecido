import { Router } from 'express';
import multer from 'multer';
import { importClientes, importProdutos } from '../controllers/importController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { representanteMiddleware } from '../middleware/representanteMiddleware';

const router = Router();

// Configurar multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel são permitidos'));
    }
  }
});

// Rota para importar clientes (representantes e admins)
router.post('/clientes', 
  authMiddleware, 
  representanteMiddleware, 
  upload.single('file'), 
  importClientes
);

// Rota para importar produtos (apenas admins)
router.post('/produtos', 
  authMiddleware, 
  adminMiddleware, 
  upload.single('file'), 
  importProdutos
);

export default router; 
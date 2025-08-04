import express from 'express';
import { clienteController } from '../controllers/clienteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { representanteMiddleware } from '../middleware/representanteMiddleware';

const router = express.Router();

// Rotas protegidas por autenticação
router.use(authMiddleware);

// Rotas públicas (acessíveis por qualquer usuário autenticado)
router.get('/', clienteController.listar);
router.get('/:id', clienteController.obter);

// Rotas para criar clientes (representantes e admins)
router.post('/', representanteMiddleware, clienteController.criar);

// Rotas protegidas (apenas admin)
router.use(adminMiddleware);
router.put('/:id', clienteController.atualizar);
router.delete('/:id', clienteController.excluir);
router.patch('/:id/status', clienteController.alterarStatus);
router.patch('/:id/reset-senha', clienteController.resetarSenha);

export default router; 
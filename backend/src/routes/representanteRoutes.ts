import express from 'express';
import { representanteController } from '../controllers/representanteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// Rotas protegidas por autenticação e restritas a administradores
router.use(authMiddleware);
router.use(adminMiddleware);

// Rotas CRUD
router.get('/', representanteController.listar);
router.get('/:id', representanteController.obter);
router.post('/', representanteController.criar);
router.put('/:id', representanteController.atualizar);
router.delete('/:id', representanteController.excluir);
router.patch('/:id/status', representanteController.alterarStatus);
router.get('/:id/clientes', representanteController.listarClientes);
router.post('/:id/clientes', representanteController.vincularClientes);
router.delete('/:id/clientes/:clienteId', representanteController.desvincularCliente);

export default router; 
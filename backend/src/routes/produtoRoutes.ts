import express from 'express';
import { produtoController } from '../controllers/produtoController';
import movimentacaoEstoqueRoutes from './movimentacaoEstoqueRoutes';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

router.get('/', produtoController.listar);
router.get('/:id', produtoController.obter);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.excluir);
router.use('/:id/movimentacoes', movimentacaoEstoqueRoutes);

export default router; 
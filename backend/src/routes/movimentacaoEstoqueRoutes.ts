import express from 'express';
import { movimentacaoEstoqueController } from '../controllers/movimentacaoEstoqueController';

const router = express.Router({ mergeParams: true });

router.post('/', movimentacaoEstoqueController.registrar);
router.get('/', movimentacaoEstoqueController.listar);

export default router; 
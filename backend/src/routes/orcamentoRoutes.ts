import express from 'express';
import { orcamentoController } from '../controllers/orcamentoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Cliente solicita orçamento
router.post('/solicitar', authMiddleware, orcamentoController.solicitar);

// Representante lista orçamentos recebidos
router.get('/representante', authMiddleware, orcamentoController.listarPorRepresentante);

// Atualizar status do orçamento
router.patch('/:id/status', authMiddleware, orcamentoController.atualizarStatus);

export default router; 
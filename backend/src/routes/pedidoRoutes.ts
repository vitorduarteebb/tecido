import { Router } from 'express';
import { pedidoController } from '../controllers/pedidoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', pedidoController.criar);
router.get('/', pedidoController.listar);
router.get('/dashboard', pedidoController.dashboard);
router.get('/numero/:numeroPedido', pedidoController.obterPorNumero);
router.get('/:id', pedidoController.obter);
router.get('/representante/:representanteId', pedidoController.listarPorRepresentante);
router.get('/cliente/:clienteId', pedidoController.listarPorCliente);
router.patch('/:id/status', pedidoController.atualizarStatus);
router.patch('/representante/:representanteId/comissoes-pagas', pedidoController.marcarComissoesPagas);

router.use(adminMiddleware);
router.put('/:id', pedidoController.editar);

export default router; 
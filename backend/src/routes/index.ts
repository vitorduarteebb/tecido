import express from 'express';
import authRoutes from './authRoutes';
import representanteRoutes from './representanteRoutes';
import clienteRoutes from './clienteRoutes';
import produtoRoutes from './produtoRoutes';
import uploadRoutes from './uploadRoutes';
import pedidoRoutes from './pedidoRoutes';
import orcamentoRoutes from './orcamentoRoutes';
import * as relatorioController from '../controllers/relatorioController';

const router = express.Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de representantes
router.use('/representantes', representanteRoutes);

// Rotas de clientes
router.use('/clientes', clienteRoutes);

// Rotas de produtos
router.use('/produtos', produtoRoutes);

// Rota de upload de imagens
router.use('/upload', uploadRoutes);

// Rotas de pedidos
router.use('/pedidos', pedidoRoutes);

// Rotas de orçamentos
router.use('/orcamentos', orcamentoRoutes);

// Relatórios
router.get('/relatorios/vendas-representante-mes', relatorioController.vendasPorRepresentanteMes);
router.get('/relatorios/vendas-produto-representante', relatorioController.vendasPorPeriodoProdutoRepresentante);
router.get('/relatorios/clientes-ranking', relatorioController.rankingClientes);

export default router; 
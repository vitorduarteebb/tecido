"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoController = void 0;
const Pedido_1 = require("../models/Pedido");
const mongoose_1 = __importDefault(require("mongoose"));
const Representante_1 = __importDefault(require("../models/Representante"));
exports.pedidoController = {
    criar: async (req, res) => {
        try {
            const { itens, condicaoPagamento, detalhePrazo } = req.body;
            if (!['avista', 'aprazo'].includes(condicaoPagamento)) {
                return res.status(400).json({ success: false, message: 'Condição de pagamento inválida' });
            }
            if (condicaoPagamento === 'aprazo' && (!detalhePrazo || detalhePrazo.trim() === '')) {
                return res.status(400).json({ success: false, message: 'Detalhe do prazo é obrigatório para condição a prazo' });
            }
            let valorTotalPedido = 0;
            let pesoTotalPedido = 0;
            const itensAtualizados = await Promise.all(itens.map(async (item) => {
                const produto = await (await Promise.resolve().then(() => __importStar(require('../models/Produto')))).Produto.findById(item.produto);
                if (!produto)
                    throw new Error('Produto não encontrado');
                const valorUnitario = condicaoPagamento === 'avista' ? produto.precoAVista : produto.precoAPrazo;
                const valorTotal = valorUnitario * item.quantidade;
                const pesoItem = produto.pesoPorMetro * item.quantidade;
                valorTotalPedido += valorTotal;
                pesoTotalPedido += pesoItem;
                return Object.assign(Object.assign({}, item), { valorUnitario,
                    valorTotal });
            }));
            const pedido = await Pedido_1.Pedido.create(Object.assign(Object.assign({}, req.body), { itens: itensAtualizados, valorTotal: valorTotalPedido, pesoTotal: pesoTotalPedido, detalhePrazo: condicaoPagamento === 'aprazo' ? detalhePrazo : undefined }));
            return res.status(201).json({ success: true, data: pedido });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao criar pedido', error });
        }
    },
    listar: async (req, res) => {
        try {
            console.log('[pedidoController] Iniciando listagem de pedidos');
            const pedidos = await Pedido_1.Pedido.find()
                .populate('cliente', 'razaoSocial nomeFantasia cnpj')
                .populate('representante', 'nome email')
                .populate('itens.produto', 'nome codigo preco');
            console.log('[pedidoController] Pedidos encontrados:', pedidos.length);
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            console.error('[pedidoController] Erro ao listar pedidos:', error);
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos', error });
        }
    },
    listarPorRepresentante: async (req, res) => {
        try {
            const { representanteId } = req.params;
            const pedidos = await Pedido_1.Pedido.find({ representante: new mongoose_1.default.Types.ObjectId(representanteId), status: { $in: ['Faturado', 'faturado'] } })
                .populate('cliente', 'razaoSocial nomeFantasia cnpj')
                .populate('representante', 'comissao nome email')
                .populate('itens.produto', 'nome codigo preco');
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do representante', error });
        }
    },
    listarPorCliente: async (req, res) => {
        try {
            const { clienteId } = req.params;
            const pedidos = await Pedido_1.Pedido.find({ cliente: clienteId })
                .populate('representante', 'nome email')
                .populate('itens.produto', 'nome codigo preco');
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do cliente', error });
        }
    },
    obter: async (req, res) => {
        try {
            const pedido = await Pedido_1.Pedido.findById(req.params.id)
                .populate('cliente', 'razaoSocial nomeFantasia cnpj')
                .populate('representante', 'nome email')
                .populate('itens.produto', 'nome codigo preco');
            if (!pedido)
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            return res.json({ success: true, data: pedido });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao obter pedido', error });
        }
    },
    atualizarStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const update = { status };
            if (status && status.toLowerCase() === 'faturado') {
                update.dataFaturamento = new Date();
            }
            const pedido = await Pedido_1.Pedido.findByIdAndUpdate(id, update, { new: true });
            if (!pedido) {
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            }
            return res.json({ success: true, data: pedido, message: 'Status atualizado com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao atualizar status do pedido', error });
        }
    },
    dashboard: async (req, res) => {
        console.log('Dashboard endpoint chamado');
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            // Faturamento mensal
            let pedidosMes = [];
            let faturamentoMensal = 0;
            try {
                pedidosMes = await Pedido_1.Pedido.find({
                    data: { $gte: startOfMonth, $lte: endOfMonth },
                    status: { $in: ['faturado', 'Entregue', 'entregue'] }
                });
                faturamentoMensal = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
            }
            catch (err) {
                console.error('Erro ao buscar pedidos do mês:', err);
                pedidosMes = [];
                faturamentoMensal = 0;
            }
            // Pedidos pendentes
            let pedidosPendentes = 0;
            try {
                pedidosPendentes = await Pedido_1.Pedido.countDocuments({ status: { $in: ['pendente', 'Aguardando Aprovação'] } });
            }
            catch (err) {
                console.error('Erro ao contar pedidos pendentes:', err);
                pedidosPendentes = 0;
            }
            // Pedidos entregues no mês
            let pedidosEntregues = 0;
            try {
                pedidosEntregues = await Pedido_1.Pedido.countDocuments({
                    status: { $in: ['Entregue', 'entregue'] },
                    data: { $gte: startOfMonth, $lte: endOfMonth }
                });
            }
            catch (err) {
                console.error('Erro ao contar pedidos entregues:', err);
                pedidosEntregues = 0;
            }
            // Pedidos atrasados
            let pedidosAtrasados = 0;
            try {
                const hoje = new Date();
                pedidosAtrasados = await Pedido_1.Pedido.countDocuments({
                    status: { $nin: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] },
                    data: { $lt: hoje }
                });
            }
            catch (err) {
                console.error('Erro ao contar pedidos atrasados:', err);
                pedidosAtrasados = 0;
            }
            // Faturamento por mês (últimos 6 meses)
            const meses = [];
            const faturamentoPorMes = [];
            for (let i = 5; i >= 0; i--) {
                try {
                    const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                    const pedidos = await Pedido_1.Pedido.find({
                        data: { $gte: inicio, $lte: fim },
                        status: { $in: ['faturado', 'Entregue', 'entregue'] }
                    });
                    const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
                    meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
                    faturamentoPorMes.push(total);
                }
                catch (err) {
                    console.error('Erro ao calcular faturamento do mês:', err);
                    meses.push('Erro');
                    faturamentoPorMes.push(0);
                }
            }
            // Pedidos recentes
            let pedidosRecentes = [];
            try {
                pedidosRecentes = await Pedido_1.Pedido.find().sort({ data: -1 }).limit(5)
                    .populate('cliente', 'razaoSocial nomeFantasia nome');
            }
            catch (err) {
                console.error('Erro ao buscar pedidos recentes:', err);
                pedidosRecentes = [];
            }
            // Ranking de representantes (top 5 por vendas)
            let ranking = [];
            try {
                ranking = await Pedido_1.Pedido.aggregate([
                    { $match: { status: { $in: ['faturado', 'Entregue', 'entregue'] } } },
                    { $group: { _id: '$representante', total: { $sum: '$valorTotal' } } },
                    { $sort: { total: -1 } },
                    { $limit: 5 }
                ]);
                // Popular nome do representante
                for (let i = 0; i < ranking.length; i++) {
                    const rep = await Representante_1.default.findById(ranking[i]._id).lean();
                    ranking[i].nome = rep ? rep.nome : 'Desconhecido';
                    ranking[i].meta = 0; // ou algum valor real se desejar
                }
            }
            catch (err) {
                console.error('Erro ao calcular ranking de representantes:', err);
                ranking = [];
            }
            // Montar resposta padronizada para o frontend
            // Faturamento mensal como array de { mes, valor }
            const faturamentoMensalArr = (meses || []).map((mes, i) => ({ mes, valor: faturamentoPorMes[i] || 0 }));
            // Ranking de representantes padronizado
            const rankingRepresentantes = (ranking || []).map((r) => ({
                nome: r.nome || 'Desconhecido',
                vendas: r.total || 0,
                meta: r.meta || 0
            }));
            // Pedidos recentes padronizados
            const pedidosRecentesArr = (pedidosRecentes || []).map(p => {
                let clienteNome = '-';
                if (typeof p.cliente === 'object' && p.cliente && 'razaoSocial' in p.cliente && typeof p.cliente.razaoSocial === 'string') {
                    clienteNome = p.cliente.razaoSocial;
                }
                else if (typeof p.cliente === 'object' && p.cliente && 'nomeFantasia' in p.cliente && typeof p.cliente.nomeFantasia === 'string') {
                    clienteNome = p.cliente.nomeFantasia;
                }
                return {
                    id: p._id,
                    cliente: clienteNome,
                    valor: p.valorTotal,
                    status: p.status,
                    data: p.data
                };
            });
            res.json({
                success: true,
                data: {
                    faturamentoMensal: faturamentoMensalArr,
                    rankingRepresentantes,
                    pedidosRecentes: pedidosRecentesArr,
                    resumo: {
                        faturamentoMes: faturamentoMensal || 0,
                        crescimentoFaturamento: 0,
                        pedidosPendentes: pedidosPendentes || 0,
                        pedidosAguardandoAprovacao: 0,
                        pedidosEntregues: pedidosEntregues || 0,
                        pedidosAtrasados: pedidosAtrasados || 0
                    }
                }
            });
            console.log('Dashboard endpoint finalizado com sucesso');
        }
        catch (error) {
            console.error('Erro geral no dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar dados do dashboard',
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    },
    marcarComissoesPagas: async (req, res) => {
        try {
            const { representanteId } = req.params;
            const result = await Pedido_1.Pedido.updateMany({ representante: new mongoose_1.default.Types.ObjectId(representanteId), comissaoPaga: false, status: { $in: ['Faturado', 'faturado'] } }, { $set: { comissaoPaga: true, dataComissaoPaga: new Date() } });
            return res.json({ success: true, modified: result.modifiedCount });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao marcar comissões como pagas', error });
        }
    },
    dashboardRepresentante: async (req, res) => {
        try {
            const { representanteId } = req.params;
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            const repObjId = new mongoose_1.default.Types.ObjectId(representanteId);
            // Buscar o representante para pegar o percentual de comissão
            const representante = await Representante_1.default.findById(repObjId);
            const percentual = (representante === null || representante === void 0 ? void 0 : representante.comissao) || 0;
            // Faturamento mensal (últimos 6 meses)
            const meses = [];
            const faturamentoPorMes = [];
            for (let i = 5; i >= 0; i--) {
                const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                const pedidos = await Pedido_1.Pedido.find({
                    representante: repObjId,
                    dataFaturamento: { $gte: inicio, $lte: fim },
                    status: { $in: ['Faturado', 'faturado'] }
                });
                const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
                meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
                faturamentoPorMes.push(total);
            }
            // Total de vendas no mês
            const pedidosMes = await Pedido_1.Pedido.find({
                representante: repObjId,
                dataFaturamento: { $gte: startOfMonth, $lte: endOfMonth },
                status: { $in: ['Faturado', 'faturado'] }
            });
            const totalVendasMes = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
            // Comissões
            const pedidosComissao = await Pedido_1.Pedido.find({ representante: repObjId, status: { $in: ['Faturado', 'faturado'] } });
            const totalComissaoPaga = pedidosComissao.filter(p => p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
            const totalComissaoPendente = pedidosComissao.filter(p => !p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
            // Pedidos recentes
            const pedidosRecentes = await Pedido_1.Pedido.find({ representante: repObjId })
                .sort({ data: -1 })
                .limit(5)
                .populate('cliente', 'razaoSocial nomeFantasia');
            // Pedidos pendentes/atrasados
            const pedidosPendentes = await Pedido_1.Pedido.countDocuments({ representante: repObjId, status: { $in: ['pendente', 'Aguardando Aprovação'] } });
            const pedidosAtrasados = await Pedido_1.Pedido.countDocuments({ representante: repObjId, status: { $nin: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] }, data: { $lt: now } });
            // Ranking de clientes (top 5)
            const rankingClientes = await Pedido_1.Pedido.aggregate([
                { $match: { representante: repObjId } },
                { $group: { _id: '$cliente', total: { $sum: '$valorTotal' } } },
                { $sort: { total: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'clientes', localField: '_id', foreignField: '_id', as: 'cliente' } },
                { $unwind: '$cliente' },
                { $project: { nome: '$cliente.razaoSocial', total: 1 } }
            ]);
            res.json({
                success: true,
                data: {
                    faturamentoMensal: meses.map((mes, i) => ({ mes, valor: faturamentoPorMes[i] })),
                    totalVendasMes,
                    totalComissaoPaga,
                    totalComissaoPendente,
                    pedidosRecentes: pedidosRecentes.map(p => ({
                        id: p._id,
                        cliente: (typeof p.cliente === 'object' && p.cliente && 'razaoSocial' in p.cliente && typeof p.cliente.razaoSocial === 'string')
                            ? (p.cliente.razaoSocial || p.cliente.nomeFantasia || '-')
                            : '-',
                        valor: p.valorTotal,
                        status: p.status,
                        data: p.data
                    })),
                    pedidosPendentes,
                    pedidosAtrasados,
                    rankingClientes
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao buscar dashboard do representante', error });
        }
    },
    editar: async (req, res) => {
        try {
            const { id } = req.params;
            // Garantir que req.user tenha os campos necessários
            const usuario = req.user || { id: 'admin', nome: 'Administrador', email: 'admin@admin.com' };
            const pedidoOriginal = await Pedido_1.Pedido.findById(id).lean();
            if (!pedidoOriginal) {
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            }
            // Salvar snapshot do pedido original
            const alteracao = {
                data: new Date(),
                usuario: {
                    id: usuario.id || usuario._id || 'admin',
                    nome: usuario.nome || usuario.name || 'Administrador',
                    email: usuario.email || 'admin@admin.com',
                },
                pedidoOriginal,
                pedidoAlterado: req.body,
                descricao: req.body.descricaoAlteracao || '',
            };
            // Atualizar pedido e adicionar histórico
            const pedidoEditado = await Pedido_1.Pedido.findByIdAndUpdate(id, Object.assign(Object.assign({}, req.body), { $push: { historicoAlteracoes: alteracao } }), { new: true });
            return res.json({ success: true, data: pedidoEditado });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao editar pedido', error });
        }
    },
};

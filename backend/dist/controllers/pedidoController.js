"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedidoController = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Função auxiliar para buscar o nome do representante/admin
const buscarNomeRepresentante = async (representanteId) => {
    // Tenta buscar como representante
    const representante = await models_1.Representante.findByPk(representanteId, { attributes: ['nome', 'email'] });
    if (representante) {
        return { nome: representante.nome, email: representante.email, tipo: 'representante' };
    }
    // Tenta buscar como admin
    const admin = await models_1.Admin.findByPk(representanteId, { attributes: ['nome', 'email'] });
    if (admin) {
        return { nome: admin.nome, email: admin.email, tipo: 'admin' };
    }
    return { nome: 'Não encontrado', email: '', tipo: 'desconhecido' };
};
exports.pedidoController = {
    criar: async (req, res) => {
        try {
            const { itens, condicaoPagamento, detalhePrazo, representante, clienteId } = req.body;
            // Validar representante
            const representanteInfo = await buscarNomeRepresentante(representante);
            if (representanteInfo.tipo === 'desconhecido') {
                return res.status(400).json({ success: false, message: 'Representante/Admin não encontrado' });
            }
            if (!['avista', 'aprazo'].includes(condicaoPagamento)) {
                return res.status(400).json({ success: false, message: 'Condição de pagamento inválida' });
            }
            if (condicaoPagamento === 'aprazo' && (!detalhePrazo || detalhePrazo.trim() === '')) {
                return res.status(400).json({ success: false, message: 'Detalhe do prazo é obrigatório para condição a prazo' });
            }
            let valorTotalPedido = 0;
            let pesoTotalPedido = 0;
            const itensAtualizados = await Promise.all(itens.map(async (item) => {
                const produto = await models_1.Produto.findByPk(item.produtoId || item.produto);
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
            // Gerar número do pedido
            const ultimoPedido = await models_1.Pedido.findOne({
                order: [['numeroPedido', 'DESC']]
            });
            let proximoNumero = 1;
            if (ultimoPedido && ultimoPedido.numeroPedido) {
                const match = ultimoPedido.numeroPedido.match(/PED-(\d{4})-(\d{4})/);
                if (match) {
                    const ano = parseInt(match[1]);
                    const numero = parseInt(match[2]);
                    const anoAtual = new Date().getFullYear();
                    if (ano === anoAtual) {
                        proximoNumero = numero + 1;
                    }
                }
            }
            const anoAtual = new Date().getFullYear();
            const numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
            const pedido = await models_1.Pedido.create(Object.assign(Object.assign({}, req.body), { itens: itensAtualizados, valorTotal: valorTotalPedido, pesoTotal: pesoTotalPedido, status: 'Em Separação', detalhePrazo: condicaoPagamento === 'aprazo' ? detalhePrazo : undefined, numeroPedido,
                clienteId, representanteId: representante }));
            return res.status(201).json({ success: true, data: pedido });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao criar pedido', error: error.message });
        }
    },
    listar: async (req, res) => {
        try {
            const pedidos = await models_1.Pedido.findAll({
                include: [
                    { model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
                    { model: models_1.Representante, as: 'representante', attributes: ['nome', 'email'] }
                ],
                order: [['data', 'DESC']]
            });
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos', error });
        }
    },
    listarPorRepresentante: async (req, res) => {
        try {
            const { representanteId } = req.params;
            const pedidos = await models_1.Pedido.findAll({
                where: { representanteId },
                include: [
                    { model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
                    { model: models_1.Representante, as: 'representante', attributes: ['nome', 'email', 'comissao'] }
                ],
                order: [['data', 'DESC']]
            });
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do representante', error });
        }
    },
    listarPorCliente: async (req, res) => {
        try {
            const { clienteId } = req.params;
            const pedidos = await models_1.Pedido.findAll({
                where: { clienteId },
                include: [
                    { model: models_1.Representante, as: 'representante', attributes: ['nome', 'email'] }
                ],
                order: [['data', 'DESC']]
            });
            return res.json({ success: true, data: pedidos, count: pedidos.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do cliente', error });
        }
    },
    obter: async (req, res) => {
        try {
            const pedido = await models_1.Pedido.findByPk(req.params.id, {
                include: [
                    { model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
                    { model: models_1.Representante, as: 'representante', attributes: ['nome', 'email'] }
                ]
            });
            if (!pedido)
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            return res.json({ success: true, data: pedido });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao obter pedido', error });
        }
    },
    obterPorNumero: async (req, res) => {
        try {
            const { numeroPedido } = req.params;
            const pedido = await models_1.Pedido.findOne({
                where: { numeroPedido },
                include: [
                    { model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
                    { model: models_1.Representante, as: 'representante', attributes: ['nome', 'email'] }
                ]
            });
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
            const pedido = await models_1.Pedido.findByPk(id);
            if (!pedido) {
                return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
            }
            await pedido.update(update);
            return res.json({ success: true, data: pedido, message: 'Status atualizado com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao atualizar status do pedido', error });
        }
    },
    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = req.user || { id: 'admin', nome: 'Administrador', email: 'admin@admin.com' };
            const pedido = await models_1.Pedido.findByPk(id);
            if (!pedido) {
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
                pedidoOriginal: pedido.toJSON(),
                pedidoAlterado: req.body,
                descricao: req.body.descricaoAlteracao || '',
            };
            // Atualizar pedido e adicionar histórico
            const historicoAlteracoes = Array.isArray(pedido.historicoAlteracoes) ? pedido.historicoAlteracoes : [];
            historicoAlteracoes.push(alteracao);
            await pedido.update(Object.assign(Object.assign({}, req.body), { historicoAlteracoes }));
            return res.json({ success: true, data: pedido });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao editar pedido', error });
        }
    },
    dashboard: async (req, res) => {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            // Faturamento mensal
            const pedidosMes = await models_1.Pedido.findAll({
                where: {
                    data: { [sequelize_1.Op.gte]: startOfMonth, [sequelize_1.Op.lte]: endOfMonth },
                    status: { [sequelize_1.Op.in]: ['faturado', 'Entregue', 'entregue'] }
                }
            });
            const faturamentoMensal = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
            // Pedidos pendentes
            const pedidosPendentes = await models_1.Pedido.count({ where: { status: { [sequelize_1.Op.in]: ['pendente', 'Aguardando Aprovação'] } } });
            // Pedidos entregues
            const pedidosEntregues = await models_1.Pedido.count({
                where: {
                    status: { [sequelize_1.Op.in]: ['Entregue', 'entregue'] },
                    data: { [sequelize_1.Op.gte]: startOfMonth, [sequelize_1.Op.lte]: endOfMonth }
                }
            });
            // Pedidos atrasados
            const pedidosAtrasados = await models_1.Pedido.count({
                where: {
                    status: { [sequelize_1.Op.notIn]: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] },
                    data: { [sequelize_1.Op.lt]: now }
                }
            });
            // Faturamento por mês (últimos 6 meses)
            const meses = [];
            const faturamentoPorMes = [];
            for (let i = 5; i >= 0; i--) {
                const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                const pedidos = await models_1.Pedido.findAll({
                    where: {
                        data: { [sequelize_1.Op.gte]: inicio, [sequelize_1.Op.lte]: fim },
                        status: { [sequelize_1.Op.in]: ['faturado', 'Entregue', 'entregue'] }
                    }
                });
                const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
                meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
                faturamentoPorMes.push(total);
            }
            // Pedidos recentes
            const pedidosRecentes = await models_1.Pedido.findAll({
                order: [['data', 'DESC']],
                limit: 5,
                include: [{ model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'nome'] }]
            });
            // Ranking de representantes (top 5 por vendas)
            const ranking = await models_1.Pedido.findAll({
                attributes: [
                    'representanteId',
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('valorTotal')), 'total']
                ],
                where: { status: { [sequelize_1.Op.in]: ['faturado', 'Entregue', 'entregue'] } },
                group: ['representanteId'],
                order: [[(0, sequelize_1.literal)('total'), 'DESC']],
                limit: 5,
                include: [{ model: models_1.Representante, as: 'representante', attributes: ['nome'] }]
            });
            const rankingRepresentantes = ranking.map((r) => {
                var _a;
                return ({
                    nome: ((_a = r.representante) === null || _a === void 0 ? void 0 : _a.nome) || 'Desconhecido',
                    vendas: r.get('total') || 0,
                    meta: 0
                });
            });
            // Faturamento mensal como array de { mes, valor }
            const faturamentoMensalArr = (meses || []).map((mes, i) => ({ mes, valor: faturamentoPorMes[i] || 0 }));
            // Pedidos recentes padronizados
            const pedidosRecentesArr = (pedidosRecentes || []).map(p => {
                let clienteNome = '-';
                if (p.cliente && typeof p.cliente.razaoSocial === 'string') {
                    clienteNome = p.cliente.razaoSocial;
                }
                else if (p.cliente && typeof p.cliente.nomeFantasia === 'string') {
                    clienteNome = p.cliente.nomeFantasia;
                }
                return {
                    id: p.id,
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
        }
        catch (error) {
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
            const [count] = await models_1.Pedido.update({ comissaoPaga: true, dataComissaoPaga: new Date() }, {
                where: {
                    representanteId,
                    comissaoPaga: false,
                    status: { [sequelize_1.Op.in]: ['Faturado', 'faturado'] }
                }
            });
            return res.json({ success: true, modified: count });
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
            const representante = await models_1.Representante.findByPk(representanteId);
            const percentual = (representante === null || representante === void 0 ? void 0 : representante.comissao) || 0;
            // Faturamento mensal (últimos 6 meses)
            const meses = [];
            const faturamentoPorMes = [];
            for (let i = 5; i >= 0; i--) {
                const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                const pedidos = await models_1.Pedido.findAll({
                    where: {
                        representanteId,
                        dataFaturamento: { [sequelize_1.Op.gte]: inicio, [sequelize_1.Op.lte]: fim },
                        status: { [sequelize_1.Op.in]: ['Faturado', 'faturado'] }
                    }
                });
                const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
                meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
                faturamentoPorMes.push(total);
            }
            // Total de vendas no mês
            const pedidosMes = await models_1.Pedido.findAll({
                where: {
                    representanteId,
                    dataFaturamento: { [sequelize_1.Op.gte]: startOfMonth, [sequelize_1.Op.lte]: endOfMonth },
                    status: { [sequelize_1.Op.in]: ['Faturado', 'faturado'] }
                }
            });
            const totalVendasMes = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
            // Comissões
            const pedidosComissao = await models_1.Pedido.findAll({
                where: { representanteId, status: { [sequelize_1.Op.in]: ['Faturado', 'faturado'] } }
            });
            const totalComissaoPaga = pedidosComissao.filter(p => p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
            const totalComissaoPendente = pedidosComissao.filter(p => !p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
            // Pedidos recentes
            const pedidosRecentes = await models_1.Pedido.findAll({
                where: { representanteId },
                order: [['data', 'DESC']],
                limit: 5,
                include: [{ model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia'] }]
            });
            // Pedidos pendentes/atrasados
            const pedidosPendentes = await models_1.Pedido.count({ where: { representanteId, status: { [sequelize_1.Op.in]: ['pendente', 'Aguardando Aprovação'] } } });
            const pedidosAtrasados = await models_1.Pedido.count({ where: { representanteId, status: { [sequelize_1.Op.notIn]: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] }, data: { [sequelize_1.Op.lt]: now } } });
            // Ranking de clientes (top 5)
            const rankingClientes = await models_1.Pedido.findAll({
                attributes: [
                    'clienteId',
                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('valorTotal')), 'total']
                ],
                where: { representanteId },
                group: ['clienteId'],
                order: [[(0, sequelize_1.literal)('total'), 'DESC']],
                limit: 5,
                include: [{ model: models_1.Cliente, as: 'cliente', attributes: ['razaoSocial'] }]
            });
            res.json({
                success: true,
                data: {
                    faturamentoMensal: meses.map((mes, i) => ({ mes, valor: faturamentoPorMes[i] })),
                    totalVendasMes,
                    totalComissaoPaga,
                    totalComissaoPendente,
                    pedidosRecentes: pedidosRecentes.map(p => {
                        var _a, _b;
                        return ({
                            id: p.id,
                            cliente: ((_a = p.cliente) === null || _a === void 0 ? void 0 : _a.razaoSocial) || ((_b = p.cliente) === null || _b === void 0 ? void 0 : _b.nomeFantasia) || '-',
                            valor: p.valorTotal,
                            status: p.status,
                            data: p.data
                        });
                    }),
                    pedidosPendentes,
                    pedidosAtrasados,
                    rankingClientes: rankingClientes.map((r) => {
                        var _a;
                        return ({
                            nome: ((_a = r.cliente) === null || _a === void 0 ? void 0 : _a.razaoSocial) || 'Desconhecido',
                            vendas: r.get('total') || 0
                        });
                    })
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: 'Erro ao buscar dashboard do representante', error });
        }
    }
};

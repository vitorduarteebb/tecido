"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingClientes = exports.vendasPorPeriodoProdutoRepresentante = exports.vendasPorRepresentanteMes = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Vendas por representante/mês
const vendasPorRepresentanteMes = async (req, res) => {
    try {
        const ano = parseInt(req.query.ano) || new Date().getFullYear();
        const pedidos = await models_1.Pedido.findAll({
            where: {
                data: {
                    [sequelize_1.Op.gte]: new Date(`${ano}-01-01T00:00:00.000Z`),
                    [sequelize_1.Op.lte]: new Date(`${ano}-12-31T23:59:59.999Z`)
                }
            },
            attributes: [
                'representanteId',
                [(0, sequelize_1.fn)('MONTH', (0, sequelize_1.col)('data')), 'mes'],
                [(0, sequelize_1.fn)('YEAR', (0, sequelize_1.col)('data')), 'ano'],
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('valorTotal')), 'totalVendas'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'totalPedidos']
            ],
            group: ['representanteId', 'mes', 'ano'],
            include: [{ model: models_1.Representante, as: 'representante', attributes: ['nome'] }],
            order: [[{ model: models_1.Representante, as: 'representante' }, 'nome', 'ASC'], ['ano', 'ASC'], ['mes', 'ASC']]
        });
        const resultado = pedidos.map((p) => {
            var _a;
            return ({
                representante: ((_a = p.representante) === null || _a === void 0 ? void 0 : _a.nome) || 'Desconhecido',
                representanteId: p.representanteId,
                mes: p.get('mes'),
                ano: p.get('ano'),
                totalVendas: p.get('totalVendas'),
                totalPedidos: p.get('totalPedidos')
            });
        });
        return res.json({ success: true, data: resultado });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
    }
};
exports.vendasPorRepresentanteMes = vendasPorRepresentanteMes;
// Vendas por período, por produto e/ou representante
const vendasPorPeriodoProdutoRepresentante = async (req, res) => {
    try {
        const { dataInicio, dataFim, produto, representante } = req.query;
        const where = {};
        if (dataInicio || dataFim) {
            where.data = {};
            if (dataInicio)
                where.data[sequelize_1.Op.gte] = new Date(dataInicio);
            if (dataFim)
                where.data[sequelize_1.Op.lte] = new Date(dataFim);
        }
        if (representante)
            where.representanteId = representante;
        // Não é possível agrupar por item.produto diretamente, então faz agrupamento manual
        const pedidos = await models_1.Pedido.findAll({ where });
        let resultado = [];
        if (produto && representante) {
            // Agrupa por produto e representante
            const agrupados = {};
            pedidos.forEach(p => {
                (p.itens || []).forEach((item) => {
                    if (item.produtoId === produto) {
                        const key = `${item.produtoId}_${p.representanteId}`;
                        if (!agrupados[key])
                            agrupados[key] = { produtoId: item.produtoId, representanteId: p.representanteId, quantidadeVendida: 0, valorTotalVendido: 0 };
                        agrupados[key].quantidadeVendida += item.quantidade;
                        agrupados[key].valorTotalVendido += item.valorTotal;
                    }
                });
            });
            resultado = Object.values(agrupados);
        }
        else if (produto) {
            // Agrupa por produto
            const agrupados = {};
            pedidos.forEach(p => {
                (p.itens || []).forEach((item) => {
                    if (item.produtoId === produto) {
                        if (!agrupados[item.produtoId])
                            agrupados[item.produtoId] = { produtoId: item.produtoId, quantidadeVendida: 0, valorTotalVendido: 0 };
                        agrupados[item.produtoId].quantidadeVendida += item.quantidade;
                        agrupados[item.produtoId].valorTotalVendido += item.valorTotal;
                    }
                });
            });
            resultado = Object.values(agrupados);
        }
        else if (representante) {
            // Agrupa por representante
            const agrupados = {};
            pedidos.forEach(p => {
                (p.itens || []).forEach((item) => {
                    if (!agrupados[p.representanteId])
                        agrupados[p.representanteId] = { representanteId: p.representanteId, quantidadeVendida: 0, valorTotalVendido: 0 };
                    agrupados[p.representanteId].quantidadeVendida += item.quantidade;
                    agrupados[p.representanteId].valorTotalVendido += item.valorTotal;
                });
            });
            resultado = Object.values(agrupados);
        }
        else {
            // Agrupa geral
            let quantidadeVendida = 0;
            let valorTotalVendido = 0;
            pedidos.forEach(p => {
                (p.itens || []).forEach((item) => {
                    quantidadeVendida += item.quantidade;
                    valorTotalVendido += item.valorTotal;
                });
            });
            resultado = [{ quantidadeVendida, valorTotalVendido }];
        }
        // Popula nomes
        for (const r of resultado) {
            if (r.produtoId) {
                const prod = await models_1.Produto.findByPk(r.produtoId);
                r.produto = (prod === null || prod === void 0 ? void 0 : prod.nome) || 'Desconhecido';
            }
            if (r.representanteId) {
                const rep = await models_1.Representante.findByPk(r.representanteId);
                r.representante = (rep === null || rep === void 0 ? void 0 : rep.nome) || 'Desconhecido';
            }
        }
        return res.json({ success: true, data: resultado });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
    }
};
exports.vendasPorPeriodoProdutoRepresentante = vendasPorPeriodoProdutoRepresentante;
// Ranking de clientes por pedidos e valor total
const rankingClientes = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;
        const where = {};
        if (dataInicio || dataFim) {
            where.data = {};
            if (dataInicio)
                where.data[sequelize_1.Op.gte] = new Date(dataInicio);
            if (dataFim)
                where.data[sequelize_1.Op.lte] = new Date(dataFim);
        }
        const pedidos = await models_1.Pedido.findAll({ where });
        const agrupados = {};
        pedidos.forEach(p => {
            if (!agrupados[p.clienteId])
                agrupados[p.clienteId] = { clienteId: p.clienteId, quantidadePedidos: 0, valorTotalComprado: 0 };
            agrupados[p.clienteId].quantidadePedidos += 1;
            agrupados[p.clienteId].valorTotalComprado += p.valorTotal;
        });
        let resultado = Object.values(agrupados);
        // Popula nomes
        for (const r of resultado) {
            const cliente = await models_1.Cliente.findByPk(r.clienteId);
            r.cliente = (cliente === null || cliente === void 0 ? void 0 : cliente.razaoSocial) || 'Desconhecido';
        }
        resultado = resultado.sort((a, b) => b.valorTotalComprado - a.valorTotalComprado);
        return res.json({ success: true, data: resultado });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
    }
};
exports.rankingClientes = rankingClientes;

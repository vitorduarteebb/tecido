import { Request, Response } from 'express';
import { Pedido, Representante, Cliente, Produto } from '../models';
import { Op, fn, col, literal } from 'sequelize';

// Vendas por representante/mês
export const vendasPorRepresentanteMes = async (req: Request, res: Response) => {
  try {
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
    const pedidos = await Pedido.findAll({
      where: {
          data: {
          [Op.gte]: new Date(`${ano}-01-01T00:00:00.000Z`),
          [Op.lte]: new Date(`${ano}-12-31T23:59:59.999Z`)
        }
      },
      attributes: [
        'representanteId',
        [fn('MONTH', col('data')), 'mes'],
        [fn('YEAR', col('data')), 'ano'],
        [fn('SUM', col('valorTotal')), 'totalVendas'],
        [fn('COUNT', col('id')), 'totalPedidos']
      ],
      group: ['representanteId', 'mes', 'ano'],
      include: [{ model: Representante, as: 'representante', attributes: ['nome'] }],
      order: [[{ model: Representante, as: 'representante' }, 'nome', 'ASC'], ['ano', 'ASC'], ['mes', 'ASC']]
    });
    const resultado = (pedidos as any[]).map((p: any) => ({
      representante: p.representante?.nome || 'Desconhecido',
      representanteId: p.representanteId,
      mes: p.get('mes'),
      ano: p.get('ano'),
      totalVendas: p.get('totalVendas'),
      totalPedidos: p.get('totalPedidos')
    }));
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
};

// Vendas por período, por produto e/ou representante
export const vendasPorPeriodoProdutoRepresentante = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim, produto, representante } = req.query;
    const where: any = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data[Op.gte] = new Date(dataInicio as string);
      if (dataFim) where.data[Op.lte] = new Date(dataFim as string);
    }
    if (representante) where.representanteId = representante;
    // Não é possível agrupar por item.produto diretamente, então faz agrupamento manual
    const pedidos = await Pedido.findAll({ where });
    let resultado: any[] = [];
    if (produto && representante) {
      // Agrupa por produto e representante
      const agrupados: any = {};
      pedidos.forEach(p => {
        (p.itens || []).forEach((item: any) => {
          if (item.produtoId === produto) {
            const key = `${item.produtoId}_${p.representanteId}`;
            if (!agrupados[key]) agrupados[key] = { produtoId: item.produtoId, representanteId: p.representanteId, quantidadeVendida: 0, valorTotalVendido: 0 };
            agrupados[key].quantidadeVendida += item.quantidade;
            agrupados[key].valorTotalVendido += item.valorTotal;
          }
        });
      });
      resultado = Object.values(agrupados);
    } else if (produto) {
      // Agrupa por produto
      const agrupados: any = {};
      pedidos.forEach(p => {
        (p.itens || []).forEach((item: any) => {
          if (item.produtoId === produto) {
            if (!agrupados[item.produtoId]) agrupados[item.produtoId] = { produtoId: item.produtoId, quantidadeVendida: 0, valorTotalVendido: 0 };
            agrupados[item.produtoId].quantidadeVendida += item.quantidade;
            agrupados[item.produtoId].valorTotalVendido += item.valorTotal;
          }
        });
      });
      resultado = Object.values(agrupados);
    } else if (representante) {
      // Agrupa por representante
      const agrupados: any = {};
      pedidos.forEach(p => {
        (p.itens || []).forEach((item: any) => {
          if (!agrupados[p.representanteId]) agrupados[p.representanteId] = { representanteId: p.representanteId, quantidadeVendida: 0, valorTotalVendido: 0 };
          agrupados[p.representanteId].quantidadeVendida += item.quantidade;
          agrupados[p.representanteId].valorTotalVendido += item.valorTotal;
        });
      });
      resultado = Object.values(agrupados);
    } else {
      // Agrupa geral
      let quantidadeVendida = 0;
      let valorTotalVendido = 0;
      pedidos.forEach(p => {
        (p.itens || []).forEach((item: any) => {
          quantidadeVendida += item.quantidade;
          valorTotalVendido += item.valorTotal;
        });
      });
      resultado = [{ quantidadeVendida, valorTotalVendido }];
    }
    // Popula nomes
    for (const r of resultado as any[]) {
      if (r.produtoId) {
        const prod = await Produto.findByPk(r.produtoId);
        r.produto = prod?.nome || 'Desconhecido';
      }
      if (r.representanteId) {
        const rep = await Representante.findByPk(r.representanteId);
        r.representante = rep?.nome || 'Desconhecido';
      }
    }
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
};

// Ranking de clientes por pedidos e valor total
export const rankingClientes = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const where: any = {};
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data[Op.gte] = new Date(dataInicio as string);
      if (dataFim) where.data[Op.lte] = new Date(dataFim as string);
    }
    const pedidos = await Pedido.findAll({ where });
    const agrupados: any = {};
    pedidos.forEach(p => {
      if (!agrupados[p.clienteId]) agrupados[p.clienteId] = { clienteId: p.clienteId, quantidadePedidos: 0, valorTotalComprado: 0 };
      agrupados[p.clienteId].quantidadePedidos += 1;
      agrupados[p.clienteId].valorTotalComprado += p.valorTotal;
    });
    let resultado = Object.values(agrupados);
    // Popula nomes
    for (const r of resultado as any[]) {
      const cliente = await Cliente.findByPk(r.clienteId);
      r.cliente = cliente?.razaoSocial || 'Desconhecido';
    }
    resultado = resultado.sort((a: any, b: any) => b.valorTotalComprado - a.valorTotalComprado);
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
}; 
import { Request, Response } from 'express';
import { Pedido } from '../models/Pedido';
import Representante from '../models/Representante';

// Vendas por representante/mês
export const vendasPorRepresentanteMes = async (req: Request, res: Response) => {
  try {
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
    // Agregação MongoDB
    const pipeline = [
      {
        $match: {
          data: {
            $gte: new Date(`${ano}-01-01T00:00:00.000Z`),
            $lte: new Date(`${ano}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: {
            representante: '$representante',
            mes: { $month: '$data' },
            ano: { $year: '$data' }
          },
          totalVendas: { $sum: '$valorTotal' },
          totalPedidos: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'representantes',
          localField: '_id.representante',
          foreignField: '_id',
          as: 'representanteInfo'
        }
      },
      {
        $unwind: '$representanteInfo'
      },
      {
        $project: {
          _id: 0,
          representante: '$representanteInfo.nome',
          representanteId: '$_id.representante',
          mes: '$_id.mes',
          ano: '$_id.ano',
          totalVendas: 1,
          totalPedidos: 1
        }
      },
      {
        $sort: { representante: 1, ano: 1, mes: 1 }
      }
    ];
    const resultado = await Pedido.aggregate(pipeline as any[]);
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
};

// Vendas por período, por produto e/ou representante
export const vendasPorPeriodoProdutoRepresentante = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim, produto, representante } = req.query;
    const match: any = {};
    if (dataInicio || dataFim) {
      match.data = {};
      if (dataInicio) match.data.$gte = new Date(dataInicio as string);
      if (dataFim) match.data.$lte = new Date(dataFim as string);
    }
    if (representante) match.representante = representante;
    if (produto) match['itens.produto'] = produto;

    // Agrupamento dinâmico
    let groupId: any = {};
    if (produto && representante) {
      groupId = { produto: '$itens.produto', representante: '$representante' };
    } else if (produto) {
      groupId = { produto: '$itens.produto' };
    } else if (representante) {
      groupId = { representante: '$representante' };
    } else {
      groupId = {};
    }

    const pipeline: any[] = [
      { $unwind: '$itens' },
      { $match: match },
      {
        $group: {
          _id: groupId,
          quantidadeVendida: { $sum: '$itens.quantidade' },
          valorTotalVendido: { $sum: '$itens.valorTotal' },
        }
      },
    ];
    // Popula produto
    if (groupId.produto) {
      pipeline.push({
        $lookup: {
          from: 'produtos',
          localField: '_id.produto',
          foreignField: '_id',
          as: 'produtoInfo'
        }
      });
      pipeline.push({ $unwind: '$produtoInfo' });
    }
    // Popula representante
    if (groupId.representante) {
      pipeline.push({
        $lookup: {
          from: 'representantes',
          localField: '_id.representante',
          foreignField: '_id',
          as: 'representanteInfo'
        }
      });
      pipeline.push({ $unwind: '$representanteInfo' });
    }
    pipeline.push({
      $project: {
        _id: 0,
        produto: groupId.produto ? '$produtoInfo.nome' : undefined,
        produtoId: groupId.produto ? '$_id.produto' : undefined,
        representante: groupId.representante ? '$representanteInfo.nome' : undefined,
        representanteId: groupId.representante ? '$_id.representante' : undefined,
        quantidadeVendida: 1,
        valorTotalVendido: 1,
      }
    });
    const resultado = await Pedido.aggregate(pipeline as any[]);
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
};

// Ranking de clientes por pedidos e valor total
export const rankingClientes = async (req: Request, res: Response) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const match: any = {};
    if (dataInicio || dataFim) {
      match.data = {};
      if (dataInicio) match.data.$gte = new Date(dataInicio as string);
      if (dataFim) match.data.$lte = new Date(dataFim as string);
    }
    const pipeline: any[] = [
      { $match: match },
      {
        $group: {
          _id: '$cliente',
          quantidadePedidos: { $sum: 1 },
          valorTotalComprado: { $sum: '$valorTotal' },
        }
      },
      {
        $lookup: {
          from: 'clientes',
          localField: '_id',
          foreignField: '_id',
          as: 'clienteInfo'
        }
      },
      { $unwind: '$clienteInfo' },
      {
        $project: {
          _id: 0,
          cliente: '$clienteInfo.razaoSocial',
          clienteId: '$_id',
          quantidadePedidos: 1,
          valorTotalComprado: 1,
        }
      },
      { $sort: { valorTotalComprado: -1 } }
    ];
    const resultado = await Pedido.aggregate(pipeline as any[]);
    return res.json({ success: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao gerar relatório', error });
  }
}; 
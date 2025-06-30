import { Request, Response } from 'express';
import { Pedido } from '../models/Pedido';
import { Produto } from '../models/Produto';
import mongoose from 'mongoose';
import Representante from '../models/Representante';
import Admin from '../models/Admin';

// Função auxiliar para buscar o nome do representante/admin
const buscarNomeRepresentante = async (representanteId: string) => {
  try {
    // Primeiro tenta buscar como representante
    const representante = await Representante.findById(representanteId).select('nome email').lean();
    if (representante) {
      return { nome: representante.nome, email: representante.email, tipo: 'representante' };
    }
    
    // Se não encontrar, tenta buscar como admin
    const admin = await Admin.findById(representanteId).select('nome email').lean();
    if (admin) {
      return { nome: admin.nome, email: admin.email, tipo: 'admin' };
    }
    
    return { nome: 'Não encontrado', email: '', tipo: 'desconhecido' };
  } catch (error) {
    console.error('Erro ao buscar representante/admin:', error);
    return { nome: 'Erro', email: '', tipo: 'erro' };
  }
};

export const pedidoController = {
  criar: async (req: Request, res: Response) => {
    try {
      console.log('[pedidoController] Iniciando criação de pedido');
      console.log('[pedidoController] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const { itens, condicaoPagamento, detalhePrazo, representante } = req.body;
      
      console.log('[pedidoController] Representante ID:', representante);
      
      // Validar se o representante existe (pode ser admin ou representante)
      const representanteInfo = await buscarNomeRepresentante(representante);
      if (representanteInfo.tipo === 'desconhecido') {
        return res.status(400).json({ 
          success: false, 
          message: 'Representante/Admin não encontrado' 
        });
      }
      
      if (!['avista', 'aprazo'].includes(condicaoPagamento)) {
        return res.status(400).json({ success: false, message: 'Condição de pagamento inválida' });
      }
      if (condicaoPagamento === 'aprazo' && (!detalhePrazo || detalhePrazo.trim() === '')) {
        return res.status(400).json({ success: false, message: 'Detalhe do prazo é obrigatório para condição a prazo' });
      }
      
      let valorTotalPedido = 0;
      let pesoTotalPedido = 0;
      
      console.log('[pedidoController] Processando itens...');
      const itensAtualizados = await Promise.all(itens.map(async (item: any) => {
        console.log('[pedidoController] Processando item:', JSON.stringify(item, null, 2));
        const produto = await Produto.findById(item.produto);
        if (!produto) throw new Error('Produto não encontrado');
        
        console.log('[pedidoController] Produto encontrado:', {
          id: produto._id,
          nome: produto.nome,
          precoAVista: produto.precoAVista,
          precoAPrazo: produto.precoAPrazo,
          pesoPorMetro: produto.pesoPorMetro
        });
        
        const valorUnitario = condicaoPagamento === 'avista' ? produto.precoAVista : produto.precoAPrazo;
        const valorTotal = valorUnitario * item.quantidade;
        const pesoItem = produto.pesoPorMetro * item.quantidade;
        
        console.log('[pedidoController] Cálculos do item:', {
          valorUnitario,
          quantidade: item.quantidade,
          valorTotal,
          pesoItem,
          condicaoPagamento
        });
        
        valorTotalPedido += valorTotal;
        pesoTotalPedido += pesoItem;
        return {
          ...item,
          valorUnitario,
          valorTotal
        };
      }));
      
      console.log('[pedidoController] Itens processados, criando pedido...');
      console.log('[pedidoController] Dados do pedido a ser criado:', {
        representante,
        valorTotal: valorTotalPedido,
        pesoTotal: pesoTotalPedido,
        itensCount: itensAtualizados.length
      });
      
      const pedidoData = {
        ...req.body,
        // Usar valores do frontend se estiverem corretos, senão usar os calculados
        itens: req.body.itens && req.body.itens.length > 0 ? req.body.itens : itensAtualizados,
        valorTotal: req.body.valorTotal && req.body.valorTotal > 0 ? req.body.valorTotal : valorTotalPedido,
        pesoTotal: req.body.pesoTotal !== undefined ? req.body.pesoTotal : pesoTotalPedido,
        status: 'Em Separação',
        detalhePrazo: condicaoPagamento === 'aprazo' ? detalhePrazo : undefined
      };
      // Remover numeroPedido se vier do frontend
      delete pedidoData.numeroPedido;
      
      // Gerar número do pedido manualmente
      const ultimoPedido = await Pedido.findOne({}, {}, { sort: { 'numeroPedido': -1 } });
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
      pedidoData.numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
      
      console.log('[pedidoController] Número do pedido gerado:', pedidoData.numeroPedido);
      
      console.log('[pedidoController] Dados completos do pedido:', JSON.stringify(pedidoData, null, 2));
      
      const pedido = new Pedido(pedidoData);
      
      console.log('[pedidoController] Instância do pedido criada, salvando...');
      await pedido.save();
      
      console.log('[pedidoController] Pedido criado com sucesso:', pedido._id);
      return res.status(201).json({ success: true, data: pedido });
    } catch (error) {
      console.error('[pedidoController] Erro detalhado ao criar pedido:', error);
      return res.status(500).json({ success: false, message: 'Erro ao criar pedido', error: error.message });
    }
  },
  listar: async (req: Request, res: Response) => {
    try {
      console.log('[pedidoController] Iniciando listagem de pedidos');
      const pedidos = await Pedido.find()
        .populate('cliente', 'razaoSocial nomeFantasia cnpj')
        .populate('itens.produto', 'nome codigo preco');
      
      // Processar representantes/admins manualmente
      const pedidosComRepresentante = await Promise.all(
        pedidos.map(async (pedido) => {
          const representanteInfo = await buscarNomeRepresentante(pedido.representante.toString());
          return {
            ...pedido.toObject(),
            representante: {
              _id: pedido.representante,
              nome: representanteInfo.nome,
              email: representanteInfo.email,
              tipo: representanteInfo.tipo
            }
          };
        })
      );
      
      console.log('[pedidoController] Pedidos encontrados:', pedidosComRepresentante.length);
      return res.json({ success: true, data: pedidosComRepresentante, count: pedidosComRepresentante.length });
    } catch (error) {
      console.error('[pedidoController] Erro ao listar pedidos:', error);
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos', error });
    }
  },
  listarPorRepresentante: async (req: Request, res: Response) => {
    try {
      const { representanteId } = req.params;
      const pedidos = await Pedido.find({ representante: new mongoose.Types.ObjectId(representanteId) })
        .populate('cliente', 'razaoSocial nomeFantasia cnpj')
        .populate('representante', 'comissao nome email')
        .populate('itens.produto', 'nome codigo preco');
      return res.json({ success: true, data: pedidos, count: pedidos.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do representante', error });
    }
  },
  listarPorCliente: async (req: Request, res: Response) => {
    try {
      const { clienteId } = req.params;
      const pedidos = await Pedido.find({ cliente: clienteId })
        .populate('representante', 'nome email')
        .populate('itens.produto', 'nome codigo preco');
      return res.json({ success: true, data: pedidos, count: pedidos.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do cliente', error });
    }
  },
  obter: async (req: Request, res: Response) => {
    try {
      const pedido = await Pedido.findById(req.params.id)
        .populate('cliente', 'razaoSocial nomeFantasia cnpj')
        .populate('itens.produto', 'nome codigo preco');
      
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      
      // Processar representante/admin manualmente
      const representanteInfo = await buscarNomeRepresentante(pedido.representante.toString());
      const pedidoComRepresentante = {
        ...pedido.toObject(),
        representante: {
          _id: pedido.representante,
          nome: representanteInfo.nome,
          email: representanteInfo.email,
          tipo: representanteInfo.tipo
        }
      };
      
      return res.json({ success: true, data: pedidoComRepresentante });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter pedido', error });
    }
  },
  obterPorNumero: async (req: Request, res: Response) => {
    try {
      const { numeroPedido } = req.params;
      const pedido = await Pedido.findOne({ numeroPedido })
        .populate('cliente', 'razaoSocial nomeFantasia cnpj')
        .populate('itens.produto', 'nome codigo preco');
      
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      
      // Processar representante/admin manualmente
      const representanteInfo = await buscarNomeRepresentante(pedido.representante.toString());
      const pedidoComRepresentante = {
        ...pedido.toObject(),
        representante: {
          _id: pedido.representante,
          nome: representanteInfo.nome,
          email: representanteInfo.email,
          tipo: representanteInfo.tipo
        }
      };
      
      return res.json({ success: true, data: pedidoComRepresentante });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter pedido', error });
    }
  },
  atualizarStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const update: any = { status };
      if (status && status.toLowerCase() === 'faturado') {
        update.dataFaturamento = new Date();
      }
      const pedido = await Pedido.findByIdAndUpdate(
        id,
        update,
        { new: true }
      );
      if (!pedido) {
        return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      }
      return res.json({ success: true, data: pedido, message: 'Status atualizado com sucesso' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao atualizar status do pedido', error });
    }
  },
  dashboard: async (req: Request, res: Response) => {
    console.log('Dashboard endpoint chamado');
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Faturamento mensal
      let pedidosMes: any[] = [];
      let faturamentoMensal = 0;
      try {
        pedidosMes = await Pedido.find({
          data: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $in: ['faturado', 'Entregue', 'entregue'] }
        });
        faturamentoMensal = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
      } catch (err) {
        console.error('Erro ao buscar pedidos do mês:', err);
        pedidosMes = [];
        faturamentoMensal = 0;
      }

      // Pedidos pendentes
      let pedidosPendentes = 0;
      try {
        pedidosPendentes = await Pedido.countDocuments({ status: { $in: ['pendente', 'Aguardando Aprovação'] } });
      } catch (err) {
        console.error('Erro ao contar pedidos pendentes:', err);
        pedidosPendentes = 0;
      }

      // Pedidos entregues no mês
      let pedidosEntregues = 0;
      try {
        pedidosEntregues = await Pedido.countDocuments({
          status: { $in: ['Entregue', 'entregue'] },
          data: { $gte: startOfMonth, $lte: endOfMonth }
        });
      } catch (err) {
        console.error('Erro ao contar pedidos entregues:', err);
        pedidosEntregues = 0;
      }

      // Pedidos atrasados
      let pedidosAtrasados = 0;
      try {
        const hoje = new Date();
        pedidosAtrasados = await Pedido.countDocuments({
          status: { $nin: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] },
          data: { $lt: hoje }
        });
      } catch (err) {
        console.error('Erro ao contar pedidos atrasados:', err);
        pedidosAtrasados = 0;
      }

      // Faturamento por mês (últimos 6 meses)
      const meses: any[] = [];
      const faturamentoPorMes: any[] = [];
      for (let i = 5; i >= 0; i--) {
        try {
          const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
          const pedidos = await Pedido.find({
            data: { $gte: inicio, $lte: fim },
            status: { $in: ['faturado', 'Entregue', 'entregue'] }
          });
          const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
          meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
          faturamentoPorMes.push(total);
        } catch (err) {
          console.error('Erro ao calcular faturamento do mês:', err);
          meses.push('Erro');
          faturamentoPorMes.push(0);
        }
      }

      // Pedidos recentes
      let pedidosRecentes: any[] = [];
      try {
        pedidosRecentes = await Pedido.find().sort({ data: -1 }).limit(5)
          .populate('cliente', 'razaoSocial nomeFantasia nome');
      } catch (err) {
        console.error('Erro ao buscar pedidos recentes:', err);
        pedidosRecentes = [];
      }

      // Ranking de representantes (top 5 por vendas)
      let ranking: any[] = [];
      try {
        ranking = await Pedido.aggregate([
          { $match: { status: { $in: ['faturado', 'Entregue', 'entregue'] } } },
          { $group: { _id: '$representante', total: { $sum: '$valorTotal' } } },
          { $sort: { total: -1 } },
          { $limit: 5 }
        ]);

        // Popular nome do representante
        for (let i = 0; i < ranking.length; i++) {
          const rep = await Representante.findById(ranking[i]._id).lean();
          ranking[i].nome = rep ? rep.nome : 'Desconhecido';
          ranking[i].meta = 0; // ou algum valor real se desejar
        }
      } catch (err) {
        console.error('Erro ao calcular ranking de representantes:', err);
        ranking = [];
      }

      // Montar resposta padronizada para o frontend
      // Faturamento mensal como array de { mes, valor }
      const faturamentoMensalArr = (meses || []).map((mes, i) => ({ mes, valor: faturamentoPorMes[i] || 0 }));
      // Ranking de representantes padronizado
      const rankingRepresentantes = (ranking || []).map((r: any) => ({
        nome: r.nome || 'Desconhecido',
        vendas: r.total || 0,
        meta: r.meta || 0
      }));
      // Pedidos recentes padronizados
      const pedidosRecentesArr = (pedidosRecentes || []).map(p => {
        let clienteNome = '-';
        if (typeof p.cliente === 'object' && p.cliente && 'razaoSocial' in p.cliente && typeof p.cliente.razaoSocial === 'string') {
          clienteNome = p.cliente.razaoSocial;
        } else if (typeof p.cliente === 'object' && p.cliente && 'nomeFantasia' in p.cliente && typeof p.cliente.nomeFantasia === 'string') {
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
    } catch (error) {
      console.error('Erro geral no dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do dashboard',
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  },
  marcarComissoesPagas: async (req: Request, res: Response) => {
    try {
      const { representanteId } = req.params;
      const result = await Pedido.updateMany(
        { representante: new mongoose.Types.ObjectId(representanteId), comissaoPaga: false, status: { $in: ['Faturado', 'faturado'] } },
        { $set: { comissaoPaga: true, dataComissaoPaga: new Date() } }
      );
      return res.json({ success: true, modified: result.modifiedCount });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao marcar comissões como pagas', error });
    }
  },
  dashboardRepresentante: async (req: Request, res: Response) => {
    try {
      const { representanteId } = req.params;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const repObjId = new mongoose.Types.ObjectId(representanteId);

      // Buscar o representante para pegar o percentual de comissão
      const representante = await Representante.findById(repObjId);
      const percentual = representante?.comissao || 0;

      // Faturamento mensal (últimos 6 meses)
      const meses: string[] = [];
      const faturamentoPorMes: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const pedidos = await Pedido.find({
          representante: repObjId,
          dataFaturamento: { $gte: inicio, $lte: fim },
          status: { $in: ['Faturado', 'faturado'] }
        });
        const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
        meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
        faturamentoPorMes.push(total);
      }

      // Total de vendas no mês
      const pedidosMes = await Pedido.find({
        representante: repObjId,
        dataFaturamento: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['Faturado', 'faturado'] }
      });
      const totalVendasMes = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);

      // Comissões
      const pedidosComissao = await Pedido.find({ representante: repObjId, status: { $in: ['Faturado', 'faturado'] } });
      const totalComissaoPaga = pedidosComissao.filter(p => p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
      const totalComissaoPendente = pedidosComissao.filter(p => !p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);

      // Pedidos recentes
      const pedidosRecentes = await Pedido.find({ representante: repObjId })
        .sort({ data: -1 })
        .limit(5)
        .populate('cliente', 'razaoSocial nomeFantasia');

      // Pedidos pendentes/atrasados
      const pedidosPendentes = await Pedido.countDocuments({ representante: repObjId, status: { $in: ['pendente', 'Aguardando Aprovação'] } });
      const pedidosAtrasados = await Pedido.countDocuments({ representante: repObjId, status: { $nin: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] }, data: { $lt: now } });

      // Ranking de clientes (top 5)
      const rankingClientes = await Pedido.aggregate([
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
              ? (p.cliente.razaoSocial || (p.cliente as any).nomeFantasia || '-')
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
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar dashboard do representante', error });
    }
  },
  editar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Garantir que req.user tenha os campos necessários
      const usuario = (req as any).user || { id: 'admin', nome: 'Administrador', email: 'admin@admin.com' };
      const pedidoOriginal = await Pedido.findById(id).lean();
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
      const pedidoEditado = await Pedido.findByIdAndUpdate(
        id,
        {
          ...req.body,
          $push: { historicoAlteracoes: alteracao }
        },
        { new: true }
      );
      return res.json({ success: true, data: pedidoEditado });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao editar pedido', error });
    }
  },
}; 
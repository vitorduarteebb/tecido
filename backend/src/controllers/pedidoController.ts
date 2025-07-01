import { Request, Response } from 'express';
import { Pedido, Produto, Cliente, Representante, Admin } from '../models';
import { Op, fn, col, literal } from 'sequelize';

// Função auxiliar para buscar o nome do representante/admin
const buscarNomeRepresentante = async (representanteId: string) => {
  // Tenta buscar como representante
  const representante = await Representante.findByPk(representanteId, { attributes: ['nome', 'email'] });
  if (representante) {
    return { nome: representante.nome, email: representante.email, tipo: 'representante' };
  }
  // Tenta buscar como admin
  const admin = await Admin.findByPk(representanteId, { attributes: ['nome', 'email'] });
  if (admin) {
    return { nome: admin.nome, email: admin.email, tipo: 'admin' };
  }
  return { nome: 'Não encontrado', email: '', tipo: 'desconhecido' };
};

export const pedidoController = {
  criar: async (req: Request, res: Response) => {
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
      const itensAtualizados = await Promise.all(itens.map(async (item: any) => {
        const produto = await Produto.findByPk(item.produtoId || item.produto);
        if (!produto) throw new Error('Produto não encontrado');
        const valorUnitario = condicaoPagamento === 'avista' ? produto.precoAVista : produto.precoAPrazo;
        const valorTotal = valorUnitario * item.quantidade;
        const pesoItem = produto.pesoPorMetro * item.quantidade;
        valorTotalPedido += valorTotal;
        pesoTotalPedido += pesoItem;
        return {
          ...item,
          valorUnitario,
          valorTotal
        };
      }));
      // Gerar número do pedido
      const ultimoPedido = await Pedido.findOne({
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
      const pedido = await Pedido.create({
        ...req.body,
        itens: itensAtualizados,
        valorTotal: valorTotalPedido,
        pesoTotal: pesoTotalPedido,
        status: 'Em Separação',
        detalhePrazo: condicaoPagamento === 'aprazo' ? detalhePrazo : undefined,
        numeroPedido,
        clienteId,
        representanteId: representante
      });
      return res.status(201).json({ success: true, data: pedido });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Erro ao criar pedido', error: error.message });
    }
  },
  listar: async (req: Request, res: Response) => {
    try {
      const pedidos = await Pedido.findAll({
        include: [
          { model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
          { model: Representante, as: 'representante', attributes: ['nome', 'email'] }
        ],
        order: [['data', 'DESC']]
      });
      return res.json({ success: true, data: pedidos, count: pedidos.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos', error });
    }
  },
  listarPorRepresentante: async (req: Request, res: Response) => {
    try {
      const { representanteId } = req.params;
      const pedidos = await Pedido.findAll({
        where: { representanteId },
        include: [
          { model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
          { model: Representante, as: 'representante', attributes: ['nome', 'email', 'comissao'] }
        ],
        order: [['data', 'DESC']]
      });
      return res.json({ success: true, data: pedidos, count: pedidos.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do representante', error });
    }
  },
  listarPorCliente: async (req: Request, res: Response) => {
    try {
      const { clienteId } = req.params;
      const pedidos = await Pedido.findAll({
        where: { clienteId },
        include: [
          { model: Representante, as: 'representante', attributes: ['nome', 'email'] }
        ],
        order: [['data', 'DESC']]
      });
      return res.json({ success: true, data: pedidos, count: pedidos.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao listar pedidos do cliente', error });
    }
  },
  obter: async (req: Request, res: Response) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          { model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
          { model: Representante, as: 'representante', attributes: ['nome', 'email'] }
        ]
      });
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      return res.json({ success: true, data: pedido });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao obter pedido', error });
    }
  },
  obterPorNumero: async (req: Request, res: Response) => {
    try {
      const { numeroPedido } = req.params;
      const pedido = await Pedido.findOne({
        where: { numeroPedido },
        include: [
          { model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'cnpj'] },
          { model: Representante, as: 'representante', attributes: ['nome', 'email'] }
        ]
      });
      if (!pedido) return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      return res.json({ success: true, data: pedido });
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
      const pedido = await Pedido.findByPk(id);
      if (!pedido) {
        return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
      }
      await pedido.update(update);
      return res.json({ success: true, data: pedido, message: 'Status atualizado com sucesso' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao atualizar status do pedido', error });
    }
  },
  editar: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const usuario = (req as any).user || { id: 'admin', nome: 'Administrador', email: 'admin@admin.com' };
      const pedido = await Pedido.findByPk(id);
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
      await pedido.update({ ...req.body, historicoAlteracoes });
      return res.json({ success: true, data: pedido });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao editar pedido', error });
    }
  },
  dashboard: async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      // Faturamento mensal
      const pedidosMes = await Pedido.findAll({
        where: {
          data: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth },
          status: { [Op.in]: ['faturado', 'Entregue', 'entregue'] }
        }
        });
      const faturamentoMensal = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
      // Pedidos pendentes
      const pedidosPendentes = await Pedido.count({ where: { status: { [Op.in]: ['pendente', 'Aguardando Aprovação'] } } });
      // Pedidos entregues
      const pedidosEntregues = await Pedido.count({
        where: {
          status: { [Op.in]: ['Entregue', 'entregue'] },
          data: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth }
        }
      });
      // Pedidos atrasados
      const pedidosAtrasados = await Pedido.count({
        where: {
          status: { [Op.notIn]: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] },
          data: { [Op.lt]: now }
        }
      });
      // Faturamento por mês (últimos 6 meses)
      const meses: string[] = [];
      const faturamentoPorMes: number[] = [];
      for (let i = 5; i >= 0; i--) {
          const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const pedidos = await Pedido.findAll({
          where: {
            data: { [Op.gte]: inicio, [Op.lte]: fim },
            status: { [Op.in]: ['faturado', 'Entregue', 'entregue'] }
          }
          });
          const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
          meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
          faturamentoPorMes.push(total);
      }
      // Pedidos recentes
      const pedidosRecentes = await Pedido.findAll({
        order: [['data', 'DESC']],
        limit: 5,
        include: [{ model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia', 'nome'] }]
      });
      // Ranking de representantes (top 5 por vendas)
      const ranking = await Pedido.findAll({
        attributes: [
          'representanteId',
          [fn('SUM', col('valorTotal')), 'total']
        ],
        where: { status: { [Op.in]: ['faturado', 'Entregue', 'entregue'] } },
        group: ['representanteId'],
        order: [[literal('total'), 'DESC']],
        limit: 5,
        include: [{ model: Representante, as: 'representante', attributes: ['nome'] }]
      });
      const rankingRepresentantes = ranking.map((r: any) => ({
        nome: r.representante?.nome || 'Desconhecido',
        vendas: r.get('total') || 0,
        meta: 0
      }));
      // Faturamento mensal como array de { mes, valor }
      const faturamentoMensalArr = (meses || []).map((mes, i) => ({ mes, valor: faturamentoPorMes[i] || 0 }));
      // Pedidos recentes padronizados
      const pedidosRecentesArr = (pedidosRecentes || []).map(p => {
        let clienteNome = '-';
        if ((p as any).cliente && typeof (p as any).cliente.razaoSocial === 'string') {
          clienteNome = (p as any).cliente.razaoSocial;
        } else if ((p as any).cliente && typeof (p as any).cliente.nomeFantasia === 'string') {
          clienteNome = (p as any).cliente.nomeFantasia;
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
    } catch (error) {
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
      const [count] = await Pedido.update(
        { comissaoPaga: true, dataComissaoPaga: new Date() },
        {
          where: {
            representanteId,
            comissaoPaga: false,
            status: { [Op.in]: ['Faturado', 'faturado'] }
          }
        }
      );
      return res.json({ success: true, modified: count });
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
      const representante = await Representante.findByPk(representanteId);
      const percentual = representante?.comissao || 0;
      // Faturamento mensal (últimos 6 meses)
      const meses: string[] = [];
      const faturamentoPorMes: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const pedidos = await Pedido.findAll({
          where: {
            representanteId,
            dataFaturamento: { [Op.gte]: inicio, [Op.lte]: fim },
            status: { [Op.in]: ['Faturado', 'faturado'] }
          }
        });
        const total = pedidos.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
        meses.push(`${inicio.getMonth() + 1}/${inicio.getFullYear()}`);
        faturamentoPorMes.push(total);
      }
      // Total de vendas no mês
      const pedidosMes = await Pedido.findAll({
        where: {
          representanteId,
          dataFaturamento: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth },
          status: { [Op.in]: ['Faturado', 'faturado'] }
        }
      });
      const totalVendasMes = pedidosMes.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
      // Comissões
      const pedidosComissao = await Pedido.findAll({
        where: { representanteId, status: { [Op.in]: ['Faturado', 'faturado'] } }
      });
      const totalComissaoPaga = pedidosComissao.filter(p => p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
      const totalComissaoPendente = pedidosComissao.filter(p => !p.comissaoPaga).reduce((acc, p) => acc + ((p.valorTotal || 0) * percentual / 100), 0);
      // Pedidos recentes
      const pedidosRecentes = await Pedido.findAll({
        where: { representanteId },
        order: [['data', 'DESC']],
        limit: 5,
        include: [{ model: Cliente, as: 'cliente', attributes: ['razaoSocial', 'nomeFantasia'] }]
      });
      // Pedidos pendentes/atrasados
      const pedidosPendentes = await Pedido.count({ where: { representanteId, status: { [Op.in]: ['pendente', 'Aguardando Aprovação'] } } });
      const pedidosAtrasados = await Pedido.count({ where: { representanteId, status: { [Op.notIn]: ['Entregue', 'entregue', 'Cancelado', 'cancelado'] }, data: { [Op.lt]: now } } });
      // Ranking de clientes (top 5)
      const rankingClientes = await Pedido.findAll({
        attributes: [
          'clienteId',
          [fn('SUM', col('valorTotal')), 'total']
        ],
        where: { representanteId },
        group: ['clienteId'],
        order: [[literal('total'), 'DESC']],
        limit: 5,
        include: [{ model: Cliente, as: 'cliente', attributes: ['razaoSocial'] }]
      });
      res.json({
        success: true,
        data: {
          faturamentoMensal: meses.map((mes, i) => ({ mes, valor: faturamentoPorMes[i] })),
          totalVendasMes,
          totalComissaoPaga,
          totalComissaoPendente,
          pedidosRecentes: pedidosRecentes.map(p => ({
            id: p.id,
            cliente: (p as any).cliente?.razaoSocial || (p as any).cliente?.nomeFantasia || '-',
            valor: p.valorTotal,
            status: p.status,
            data: p.data
          })),
          pedidosPendentes,
          pedidosAtrasados,
          rankingClientes: rankingClientes.map((r: any) => ({
            nome: r.cliente?.razaoSocial || 'Desconhecido',
            vendas: r.get('total') || 0
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao buscar dashboard do representante', error });
    }
  }
}; 
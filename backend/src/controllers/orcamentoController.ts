import { Request, Response } from 'express';
import { Orcamento } from '../models/Orcamento';
import { Cliente } from '../models/Cliente';

export const orcamentoController = {
  async solicitar(req: Request, res: Response) {
    try {
      const { produtoId, quantidade, observacao } = req.body;
      const clienteId = req.user?.id || req.body.clienteId;
      if (!clienteId) return res.status(400).json({ success: false, message: 'Cliente não informado' });
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
      const representanteId = Array.isArray(cliente.representantes) ? cliente.representantes[0] : undefined;
      if (!representanteId) return res.status(403).json({ success: false, message: 'Cliente não possui representante vinculado' });
      const orcamento = await Orcamento.create({
        cliente: clienteId,
        representante: representanteId,
        produto: produtoId,
        quantidade,
        observacao,
        status: 'pendente',
      });
      return res.status(201).json({ success: true, data: orcamento, message: 'Solicitação de orçamento registrada' });
    } catch (error) {
      console.error('Erro ao solicitar orçamento:', error);
      return res.status(500).json({ success: false, message: 'Erro ao solicitar orçamento' });
    }
  },

  async listarPorRepresentante(req: Request, res: Response) {
    try {
      const representanteId = req.user?.id || req.params.representanteId;
      const orcamentos = await Orcamento.find({ representante: representanteId })
        .populate('cliente', 'nome razaoSocial')
        .populate('produto', 'nome codigo');
      return res.json({ success: true, data: orcamentos });
    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
      return res.status(500).json({ success: false, message: 'Erro ao listar orçamentos' });
    }
  },

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const orcamento = await Orcamento.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
      if (!orcamento) {
        return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
      }
      return res.json({ success: true, data: orcamento });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Erro ao atualizar status do orçamento' });
    }
  }
}; 
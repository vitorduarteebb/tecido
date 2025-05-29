import { Request, Response } from 'express';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';
import { Produto } from '../models/Produto';

export const movimentacaoEstoqueController = {
  async registrar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tipo, quantidade, usuario, observacao } = req.body;
      if (!['entrada', 'saida'].includes(tipo)) {
        return res.status(400).json({ success: false, message: 'Tipo inválido' });
      }
      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ success: false, message: 'Produto não encontrado' });
      }
      // Atualiza o estoque do produto
      let novaQuantidade = produto.estoque.quantidade;
      if (tipo === 'entrada') novaQuantidade += quantidade;
      else if (tipo === 'saida') novaQuantidade -= quantidade;
      if (novaQuantidade < 0) {
        return res.status(400).json({ success: false, message: 'Estoque insuficiente' });
      }
      produto.estoque.quantidade = novaQuantidade;
      await produto.save();
      // Registra a movimentação
      const mov = await MovimentacaoEstoque.create({
        produto: produto._id,
        tipo,
        quantidade,
        usuario,
        observacao
      });
      return res.status(201).json({ success: true, data: mov, estoqueAtual: novaQuantidade });
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      return res.status(500).json({ success: false, message: 'Erro ao registrar movimentação' });
    }
  },

  async listar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const movs = await MovimentacaoEstoque.find({ produto: id }).sort({ data: -1 });
      return res.json({ success: true, data: movs });
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      return res.status(500).json({ success: false, message: 'Erro ao listar movimentações' });
    }
  }
}; 
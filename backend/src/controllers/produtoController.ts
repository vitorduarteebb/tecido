import { Request, Response } from 'express';
import { Produto } from '../models/Produto';

export const produtoController = {
  async listar(req: Request, res: Response) {
    try {
      console.log('[produtoController] Iniciando listagem de produtos');
      const produtos = await Produto.find().sort({ dataCadastro: -1 });
      console.log('[produtoController] Produtos encontrados:', produtos.length);
      return res.json({ success: true, data: produtos, count: produtos.length });
    } catch (error) {
      console.error('[produtoController] Erro ao listar produtos:', error);
      return res.status(500).json({ success: false, message: 'Erro ao listar produtos' });
    }
  },

  async obter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ success: false, message: 'Produto não encontrado' });
      }
      return res.json({ success: true, data: produto });
    } catch (error) {
      console.error('Erro ao obter produto:', error);
      return res.status(500).json({ success: false, message: 'Erro ao obter produto' });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const { precoAVista, precoAPrazo, pesoPorMetro } = req.body;
      if (precoAVista === undefined || precoAPrazo === undefined || pesoPorMetro === undefined) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios: precoAVista, precoAPrazo, pesoPorMetro' });
      }
      const novoProduto = await Produto.create(req.body);
      return res.status(201).json({ success: true, data: novoProduto, message: 'Produto cadastrado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({ success: false, message: 'Erro ao criar produto' });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { precoAVista, precoAPrazo, pesoPorMetro } = req.body;
      if (precoAVista === undefined || precoAPrazo === undefined || pesoPorMetro === undefined) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios: precoAVista, precoAPrazo, pesoPorMetro' });
      }
      const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, { new: true });
      if (!produtoAtualizado) {
        return res.status(404).json({ success: false, message: 'Produto não encontrado' });
      }
      return res.json({ success: true, data: produtoAtualizado, message: 'Produto atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({ success: false, message: 'Erro ao atualizar produto' });
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await Produto.findByIdAndDelete(id);
      if (!produto) {
        return res.status(404).json({ success: false, message: 'Produto não encontrado' });
      }
      return res.json({ success: true, message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return res.status(500).json({ success: false, message: 'Erro ao excluir produto' });
    }
  }
}; 
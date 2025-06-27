import api from './api';
import { AxiosResponse } from 'axios';
import { Produto } from '../types/produto';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export interface MovimentacaoEstoque {
  _id: string;
  produto: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  usuario: string;
  observacao?: string;
}

export const produtoService = {
  listar: async (): Promise<Produto[]> => {
    console.log('[produtoService] Fazendo requisição para /produtos');
    const response: AxiosResponse<ApiResponse<Produto[]>> = await api.get('/produtos');
    console.log('[produtoService] Resposta recebida:', response.data);
    return response.data.data;
  },

  obterPorId: async (id: string): Promise<Produto> => {
    const response: AxiosResponse<ApiResponse<Produto>> = await api.get(`/produtos/${id}`);
    return response.data.data;
  },

  criar: async (produto: Omit<Produto, 'id'>): Promise<Produto> => {
    const response: AxiosResponse<ApiResponse<Produto>> = await api.post('/produtos', produto);
    return response.data.data;
  },

  atualizar: async (id: string, produto: Partial<Produto>): Promise<Produto> => {
    const response: AxiosResponse<ApiResponse<Produto>> = await api.put(`/produtos/${id}`, produto);
    return response.data.data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },

  registrarMovimentacao: async (produtoId: string, movimentacao: { tipo: 'entrada' | 'saida'; quantidade: number; usuario: string; observacao?: string }) => {
    const response: AxiosResponse<any> = await api.post(`/produtos/${produtoId}/movimentacoes`, movimentacao);
    return response.data;
  },

  listarMovimentacoes: async (produtoId: string): Promise<MovimentacaoEstoque[]> => {
    const response: AxiosResponse<ApiResponse<MovimentacaoEstoque[]>> = await api.get(`/produtos/${produtoId}/movimentacoes`);
    return response.data.data;
  }
}; 
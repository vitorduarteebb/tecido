import api from './api';
import { AxiosResponse } from 'axios';
import { Cliente } from '../types';

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Pedido {
  id: string;
  data: string;
  valor: number;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const clienteService = {
  listar: async (): Promise<Cliente[]> => {
    const response: AxiosResponse<ApiResponse<any[]>> = await api.get('/clientes');
    return response.data.data.map((c: any) => ({ ...c, id: c.id || c._id, representantes: c.representantes || [] }));
  },

  obterPorId: async (id: string): Promise<Cliente> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get(`/clientes/${id}`);
    const c = response.data.data;
    return { ...c, id: c.id || c._id };
  },

  criar: async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    try {
      // Garante que o limiteCredito seja um número
      const dadosFormatados = {
        ...cliente,
        limiteCredito: Number(cliente.limiteCredito),
        status: cliente.status || 'ativo'
      };

      const response: AxiosResponse<ApiResponse<Cliente>> = await api.post('/clientes', dadosFormatados);
      return response.data.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  atualizar: async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    const response: AxiosResponse<ApiResponse<Cliente>> = await api.put(`/clientes/${id}`, cliente);
    return response.data.data;
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },

  alterarStatus: async (id: string, ativar: boolean): Promise<Cliente> => {
    const response: AxiosResponse<ApiResponse<Cliente>> = await api.patch(`/clientes/${id}/status`, {
      status: ativar ? 'ativo' : 'inativo'
    });
    return response.data.data;
  },

  listarPedidos: async (clienteId: string): Promise<Pedido[]> => {
    const response: AxiosResponse<ApiResponse<Pedido[]>> = await api.get(`/clientes/${clienteId}/pedidos`);
    return response.data.data;
  }
}; 
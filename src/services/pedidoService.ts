import api from './api';
import { AxiosResponse } from 'axios';

export interface ItemPedido {
  produto: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Pedido {
  _id?: string;
  id?: string;
  numeroPedido?: string;
  cliente: string | { razaoSocial?: string; nomeFantasia?: string; nome?: string; cnpj?: string; id?: string };
  representante: string | { nome?: string; razaoSocial?: string; id?: string };
  itens: ItemPedido[];
  valorTotal: number;
  condicaoPagamento: 'avista' | 'aprazo';
  detalhePrazo?: string;
  pesoTotal: number;
  status?: string;
  data?: string;
  dataCriacao?: string;
  observacoes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const pedidoService = {
  criar: async (pedido: Omit<Pedido, '_id' | 'status' | 'data'>) => {
    const response: AxiosResponse<ApiResponse<Pedido>> = await api.post('/pedidos', pedido);
    return response.data.data;
  },
  listar: async (): Promise<Pedido[]> => {
    console.log('[pedidoService] Fazendo requisição para /pedidos');
    const response: AxiosResponse<ApiResponse<Pedido[]>> = await api.get('/pedidos');
    console.log('[pedidoService] Resposta recebida:', response.data);
    return response.data.data;
  },
  listarPorRepresentante: async (representanteId: string): Promise<Pedido[]> => {
    const response: AxiosResponse<ApiResponse<Pedido[]>> = await api.get(`/pedidos/representante/${representanteId}`);
    return response.data.data;
  },
  listarPorCliente: async (clienteId: string): Promise<Pedido[]> => {
    const response: AxiosResponse<ApiResponse<Pedido[]>> = await api.get(`/pedidos/cliente/${clienteId}`);
    return response.data.data;
  },
  obter: async (id: string): Promise<Pedido> => {
    const response: AxiosResponse<ApiResponse<Pedido>> = await api.get(`/pedidos/${id}`);
    return response.data.data;
  },
  obterPorNumero: async (numeroPedido: string): Promise<Pedido> => {
    const response: AxiosResponse<ApiResponse<Pedido>> = await api.get(`/pedidos/numero/${numeroPedido}`);
    return response.data.data;
  },
  atualizarStatus: async (id: string, status: string) => {
    const response: AxiosResponse<ApiResponse<any>> = await api.patch(`/pedidos/${id}/status`, { status });
    return response.data.data;
  },
  editar: async (id: string, pedido: any, descricaoAlteracao?: string) => {
    const response: AxiosResponse<ApiResponse<Pedido>> = await api.put(`/pedidos/${id}`, { ...pedido, descricaoAlteracao });
    return response.data.data;
  },
}; 
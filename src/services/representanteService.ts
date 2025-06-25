import api from './api';

interface Representante {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  status: string;
  comissao?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}

export const representanteService = {
  listar: async (): Promise<Representante[]> => {
    try {
      console.log('Iniciando requisição para listar representantes');
      const response = await api.get<ApiResponse<any[]>>('/representantes');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao listar representantes');
      }
      
      const data = response.data.data.map(rep => ({
        ...rep,
        id: rep.id || rep._id
      }));
      console.log(`${response.data.count} representantes recebidos do servidor`);
      return data;
    } catch (error) {
      console.error('Erro detalhado ao listar representantes:', error);
      throw error;
    }
  },

  obter: async (id: string): Promise<Representante> => {
    try {
      const response = await api.get(`/representantes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter representante:', error);
      throw error;
    }
  },

  criar: async (dados: Omit<Representante, 'id'>): Promise<Representante> => {
    try {
      const response = await api.post('/representantes', dados);
      
      // Trata a nova estrutura de resposta
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erro ao criar representante');
      }
    } catch (error) {
      console.error('Erro ao criar representante:', error);
      throw error;
    }
  },

  atualizar: async (id: string, dados: Partial<Representante>): Promise<Representante> => {
    try {
      const response = await api.put(`/representantes/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar representante:', error);
      throw error;
    }
  },

  excluir: async (id: string): Promise<void> => {
    try {
      await api.delete(`/representantes/${id}`);
    } catch (error) {
      console.error('Erro ao excluir representante:', error);
      throw error;
    }
  },

  alterarStatus: async (id: string, ativo: boolean): Promise<Representante> => {
    try {
      const response = await api.patch(`/representantes/${id}/status`, { ativo });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do representante:', error);
      throw error;
    }
  },

  listarClientes: async (representanteId: string) => {
    const response = await api.get(`/representantes/${representanteId}/clientes`);
    return response.data.data;
  },

  vincularClientes: async (representanteId: string, clientesIds: string[]) => {
    const response = await api.post(`/representantes/${representanteId}/clientes`, { clientesIds });
    return response.data;
  },

  desvincularCliente: async (representanteId: string, clienteId: string) => {
    const response = await api.delete(`/representantes/${representanteId}/clientes/${clienteId}`);
    return response.data;
  },

  historicoVendas: async (representanteId: string) => {
    const response = await api.get(`/pedidos/representante/${representanteId}`);
    return response.data.data || [];
  },

  marcarComissoesPagas: async (representanteId: string) => {
    await api.patch(`/pedidos/representante/${representanteId}/comissoes-pagas`);
  }
}; 
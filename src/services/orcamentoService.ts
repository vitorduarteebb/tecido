import api from './api';

export const orcamentoService = {
  listarPorRepresentante: async () => {
    const response = await api.get('/orcamentos/representante');
    return response.data.data || [];
  },
  atualizarStatus: async (id: string, status: string) => {
    await api.patch(`/orcamentos/${id}/status`, { status });
  }
}; 
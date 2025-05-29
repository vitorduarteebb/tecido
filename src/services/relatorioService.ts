import api from './api';

export const relatorioService = {
  vendasPorRepresentanteMes: (ano: number) =>
    api.get('/relatorios/vendas-representante-mes', { params: { ano } }).then(res => res.data.data),

  vendasPorPeriodoProdutoRepresentante: (filtros: any) =>
    api.get('/relatorios/vendas-produto-representante', { params: filtros }).then(res => res.data.data),

  rankingClientes: (filtros: any) =>
    api.get('/relatorios/clientes-ranking', { params: filtros }).then(res => res.data.data),
}; 
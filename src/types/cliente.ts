export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Cliente {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  email: string;
  telefone: string;
  celular?: string;
  endereco?: Endereco;
  status: 'ativo' | 'inativo';
  representante?: string;
  limiteCredito?: number;
  condicaoPagamento?: string;
  representantes?: string[];
} 
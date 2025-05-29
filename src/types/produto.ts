export interface Produto {
  id: number;
  _id?: string;
  codigo: string;
  nome: string;
  descricao: string;
  imagem: string;
  especificacoes: {
    composicao: string;
    largura: string;
    gramatura: string;
    rendimento: string;
    cor: string;
    padronagem: string;
  };
  preco: {
    valor: number;
    unidade: 'metro' | 'kg';
  };
  precoAVista: number;
  precoAPrazo: number;
  pesoPorMetro: number;
  estoque: {
    quantidade: number;
    unidade: 'metro' | 'kg';
  };
  categoria: string;
  tags: string[];
  dataCadastro: string;
  status: 'ativo' | 'inativo';
} 
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduto extends Document {
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
  dataCadastro: Date;
  status: 'ativo' | 'inativo';
}

const especificacoesSchema = new Schema({
  composicao: { type: String, required: true },
  largura: { type: String, required: true },
  gramatura: { type: String, required: true },
  rendimento: { type: String, required: true },
  cor: { type: String, required: true },
  padronagem: { type: String, required: true },
}, { _id: false });

const precoSchema = new Schema({
  valor: { type: Number, required: true },
  unidade: { type: String, enum: ['metro', 'kg'], required: true },
}, { _id: false });

const estoqueSchema = new Schema({
  quantidade: { type: Number, required: true },
  unidade: { type: String, enum: ['metro', 'kg'], required: true },
}, { _id: false });

const produtoSchema = new Schema<IProduto>({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  imagem: { type: String },
  especificacoes: { type: especificacoesSchema, required: true },
  preco: { type: precoSchema, required: true },
  precoAVista: { type: Number, required: true },
  precoAPrazo: { type: Number, required: true },
  pesoPorMetro: { type: Number, required: true },
  estoque: { type: estoqueSchema, required: true },
  categoria: { type: String, required: true },
  tags: { type: [String], default: [] },
  dataCadastro: { type: Date, default: Date.now },
  status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
});

export const Produto = mongoose.model<IProduto>('Produto', produtoSchema); 
import mongoose, { Schema, Document } from 'mongoose';

interface IEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ICliente extends Document {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
  celular: string;
  endereco: IEndereco;
  status: 'ativo' | 'inativo';
  representantes: mongoose.Types.ObjectId[];
  limiteCredito: number;
  condicaoPagamento: string;
  usuario: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enderecoSchema = new Schema<IEndereco>({
  cep: { type: String, required: true },
  logradouro: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true }
});

const clienteSchema = new Schema<ICliente>({
  razaoSocial: { type: String, required: true },
  nomeFantasia: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  inscricaoEstadual: { type: String, required: true },
  email: { type: String, required: true },
  telefone: { type: String, required: true },
  celular: { type: String },
  endereco: { type: enderecoSchema, required: true },
  status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  representantes: [{ type: Schema.Types.ObjectId, ref: 'Representante', required: false }],
  limiteCredito: { type: Number, required: true },
  condicaoPagamento: { type: String, required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const Cliente = mongoose.model<ICliente>('Cliente', clienteSchema); 
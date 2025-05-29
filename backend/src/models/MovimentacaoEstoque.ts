import mongoose, { Schema, Document } from 'mongoose';

export interface IMovimentacaoEstoque extends Document {
  produto: mongoose.Types.ObjectId;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: Date;
  usuario: string;
  observacao?: string;
}

const movimentacaoEstoqueSchema = new Schema<IMovimentacaoEstoque>({
  produto: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
  tipo: { type: String, enum: ['entrada', 'saida'], required: true },
  quantidade: { type: Number, required: true },
  data: { type: Date, default: Date.now },
  usuario: { type: String, required: true },
  observacao: { type: String }
});

export const MovimentacaoEstoque = mongoose.model<IMovimentacaoEstoque>('MovimentacaoEstoque', movimentacaoEstoqueSchema); 
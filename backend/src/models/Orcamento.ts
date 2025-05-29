import mongoose, { Document, Schema } from 'mongoose';

export interface IOrcamento extends Document {
  cliente: mongoose.Types.ObjectId;
  representante: mongoose.Types.ObjectId;
  produto: mongoose.Types.ObjectId;
  quantidade: number;
  observacao?: string;
  status: 'pendente' | 'respondido';
  dataSolicitacao: Date;
}

const orcamentoSchema = new Schema<IOrcamento>({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  representante: { type: Schema.Types.ObjectId, ref: 'Representante', required: true },
  produto: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true },
  observacao: { type: String },
  status: { type: String, enum: ['pendente', 'respondido'], default: 'pendente' },
  dataSolicitacao: { type: Date, default: Date.now },
});

export const Orcamento = mongoose.model<IOrcamento>('Orcamento', orcamentoSchema); 
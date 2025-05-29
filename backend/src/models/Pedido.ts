import mongoose, { Document, Schema } from 'mongoose';

export interface ItemPedido {
  produto: mongoose.Types.ObjectId;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface AlteracaoPedido {
  data: Date;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  pedidoOriginal: any;
  pedidoAlterado: any;
  descricao?: string;
}

export interface IPedido extends Document {
  cliente: mongoose.Types.ObjectId;
  representante: mongoose.Types.ObjectId;
  itens: ItemPedido[];
  valorTotal: number;
  condicaoPagamento: 'avista' | 'aprazo';
  detalhePrazo?: string;
  pesoTotal: number;
  status: 'Em Separação' | 'Faturado' | 'Enviado' | 'Aguardando Estoque';
  data: Date;
  observacoes?: string;
  comissaoPaga: boolean;
  dataComissaoPaga: Date;
  dataFaturamento?: Date;
  historicoAlteracoes?: AlteracaoPedido[];
}

const itemPedidoSchema = new Schema<ItemPedido>({
  produto: { type: Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true },
  valorUnitario: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
});

const alteracaoPedidoSchema = new Schema({
  data: { type: Date, default: Date.now },
  usuario: {
    id: String,
    nome: String,
    email: String,
  },
  pedidoOriginal: Schema.Types.Mixed,
  pedidoAlterado: Schema.Types.Mixed,
  descricao: String,
}, { _id: false });

const pedidoSchema = new Schema<IPedido>({
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  representante: { type: Schema.Types.ObjectId, ref: 'Representante', required: true },
  itens: [itemPedidoSchema],
  valorTotal: { type: Number, required: true },
  condicaoPagamento: { type: String, enum: ['avista', 'aprazo'], required: true },
  detalhePrazo: { type: String },
  pesoTotal: { type: Number, required: true },
  status: { type: String, enum: [
    'Em Separação', 'Faturado', 'Enviado', 'Aguardando Estoque'
  ], default: 'Em Separação' },
  data: { type: Date, default: Date.now },
  observacoes: { type: String },
  comissaoPaga: { type: Boolean, default: false },
  dataComissaoPaga: { type: Date },
  dataFaturamento: { type: Date },
  historicoAlteracoes: { type: [alteracaoPedidoSchema], default: [] },
});

export const Pedido = mongoose.model<IPedido>('Pedido', pedidoSchema); 
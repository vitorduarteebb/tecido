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
  numeroPedido: string;
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
  numeroPedido: { type: String, required: true, unique: true },
  cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  representante: { type: Schema.Types.ObjectId, required: true },
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

// Função para gerar número do pedido
pedidoSchema.pre('save', async function(next) {
  if (this.isNew && !this.numeroPedido) {
    try {
      // Busca o último pedido para pegar o próximo número
      const ultimoPedido = await mongoose.model('Pedido').findOne({}, {}, { sort: { 'numeroPedido': -1 } });
      
      let proximoNumero = 1;
      if (ultimoPedido && ultimoPedido.numeroPedido) {
        // Extrai o número do último pedido (formato: PED-2024-0001)
        const match = ultimoPedido.numeroPedido.match(/PED-(\d{4})-(\d{4})/);
        if (match) {
          const ano = parseInt(match[1]);
          const numero = parseInt(match[2]);
          const anoAtual = new Date().getFullYear();
          
          if (ano === anoAtual) {
            proximoNumero = numero + 1;
          }
        }
      }
      
      const anoAtual = new Date().getFullYear();
      this.numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número do pedido:', error);
      // Fallback: usar timestamp se houver erro
      this.numeroPedido = `PED-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

export const Pedido = mongoose.model<IPedido>('Pedido', pedidoSchema); 
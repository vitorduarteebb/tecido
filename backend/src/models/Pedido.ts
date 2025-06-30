import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ItemPedido {
  produtoId: string;
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

export interface IPedido {
  id?: string;
  numeroPedido: string;
  clienteId: string;
  representanteId: string;
  itens: ItemPedido[];
  valorTotal: number;
  condicaoPagamento: 'avista' | 'aprazo';
  detalhePrazo?: string;
  pesoTotal: number;
  status: 'Em Separação' | 'Faturado' | 'Enviado' | 'Aguardando Estoque';
  data: Date;
  observacoes?: string;
  comissaoPaga: boolean;
  dataComissaoPaga?: Date;
  dataFaturamento?: Date;
  historicoAlteracoes?: AlteracaoPedido[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PedidoCreationAttributes extends Optional<IPedido, 'id' | 'numeroPedido' | 'data' | 'comissaoPaga' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Pedido extends Model<IPedido, PedidoCreationAttributes> implements IPedido {
  public id!: string;
  public numeroPedido!: string;
  public clienteId!: string;
  public representanteId!: string;
  public itens!: ItemPedido[];
  public valorTotal!: number;
  public condicaoPagamento!: 'avista' | 'aprazo';
  public detalhePrazo?: string;
  public pesoTotal!: number;
  public status!: 'Em Separação' | 'Faturado' | 'Enviado' | 'Aguardando Estoque';
  public data!: Date;
  public observacoes?: string;
  public comissaoPaga!: boolean;
  public dataComissaoPaga?: Date;
  public dataFaturamento?: Date;
  public historicoAlteracoes?: AlteracaoPedido[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pedido.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numeroPedido: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  clienteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  representanteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'representantes',
      key: 'id'
    }
  },
  itens: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  valorTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  condicaoPagamento: {
    type: DataTypes.ENUM('avista', 'aprazo'),
    allowNull: false,
  },
  detalhePrazo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pesoTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Em Separação', 'Faturado', 'Enviado', 'Aguardando Estoque'),
    allowNull: false,
    defaultValue: 'Em Separação',
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  comissaoPaga: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  dataComissaoPaga: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dataFaturamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  historicoAlteracoes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
}, {
  sequelize,
  tableName: 'pedidos',
  timestamps: true,
});

// Hook para gerar número do pedido
Pedido.beforeCreate(async (pedido: Pedido) => {
  if (!pedido.numeroPedido) {
    try {
      // Busca o último pedido para pegar o próximo número
      const ultimoPedido = await Pedido.findOne({
        order: [['numeroPedido', 'DESC']]
      });
      
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
      pedido.numeroPedido = `PED-${anoAtual}-${proximoNumero.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Erro ao gerar número do pedido:', error);
      // Fallback: usar timestamp se houver erro
      pedido.numeroPedido = `PED-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    }
  }
});

export default Pedido; 
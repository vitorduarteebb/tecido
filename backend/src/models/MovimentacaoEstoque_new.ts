import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from '../config/database';

export interface IMovimentacaoEstoque {
  id?: string;
  produtoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data?: Date;
  usuario: string;
  observacao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovimentacaoEstoqueCreationAttributes extends Optional<IMovimentacaoEstoque, 'id' | 'data' | 'createdAt' | 'updatedAt'> {}

export class MovimentacaoEstoque extends Model<IMovimentacaoEstoque, MovimentacaoEstoqueCreationAttributes> implements IMovimentacaoEstoque {
  public id!: string;
  public produtoId!: string;
  public tipo!: 'entrada' | 'saida';
  public quantidade!: number;
  public data!: Date;
  public usuario!: string;
  public observacao?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MovimentacaoEstoque.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  produtoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'produtos',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'saida'),
    allowNull: false,
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'movimentacoes_estoque',
  timestamps: true,
});

export default MovimentacaoEstoque; 
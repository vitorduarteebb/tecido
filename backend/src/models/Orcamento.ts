import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IOrcamento {
  id?: string;
  clienteId: string;
  representanteId: string;
  produtoId: string;
  quantidade: number;
  observacao?: string;
  status: 'pendente' | 'respondido';
  dataSolicitacao?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrcamentoCreationAttributes extends Optional<IOrcamento, 'id' | 'status' | 'dataSolicitacao' | 'createdAt' | 'updatedAt'> {}

export class Orcamento extends Model<IOrcamento, OrcamentoCreationAttributes> implements IOrcamento {
  public id!: string;
  public clienteId!: string;
  public representanteId!: string;
  public produtoId!: string;
  public quantidade!: number;
  public observacao?: string;
  public status!: 'pendente' | 'respondido';
  public dataSolicitacao!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Orcamento.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
  produtoId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'produtos',
      key: 'id'
    }
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pendente', 'respondido'),
    allowNull: false,
    defaultValue: 'pendente',
  },
  dataSolicitacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'orcamentos',
  timestamps: true,
});

export default Orcamento; 
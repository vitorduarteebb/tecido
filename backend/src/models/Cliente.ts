import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ICliente {
  id?: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  email: string;
  telefone: string;
  celular?: string;
  endereco: any;
  status: string;
  representantes?: string;
  usuario?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClienteCreationAttributes extends Optional<ICliente, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class Cliente extends Model<ICliente, ClienteCreationAttributes> implements ICliente {
  public id!: string;
  public razaoSocial!: string;
  public nomeFantasia!: string;
  public cnpj!: string;
  public inscricaoEstadual!: string;
  public email!: string;
  public telefone!: string;
  public celular?: string;
  public endereco!: any;
  public status!: string;
  public representantes?: string;
  public usuario?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cliente.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  razaoSocial: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomeFantasia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  inscricaoEstadual: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  celular: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  endereco: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ativo',
  },
  representantes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'clientes',
  timestamps: true,
});

export default Cliente; 
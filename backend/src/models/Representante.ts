import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IRepresentante {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  regiao: string;
  status: 'Ativo' | 'Inativo';
  senha: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  comissao: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RepresentanteCreationAttributes extends Optional<IRepresentante, 'id' | 'status' | 'dataCriacao' | 'dataAtualizacao' | 'comissao' | 'createdAt' | 'updatedAt'> {}

export class Representante extends Model<IRepresentante, RepresentanteCreationAttributes> implements IRepresentante {
  public id!: string;
  public nome!: string;
  public email!: string;
  public telefone!: string;
  public regiao!: string;
  public status!: 'Ativo' | 'Inativo';
  public senha!: string;
  public dataCriacao!: Date;
  public dataAtualizacao!: Date;
  public comissao!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Representante.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telefone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  regiao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Ativo', 'Inativo'),
    allowNull: false,
    defaultValue: 'Ativo',
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dataCriacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dataAtualizacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  comissao: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'representantes',
  timestamps: true,
});

// Hook para atualizar dataAtualizacao
Representante.beforeUpdate((representante: Representante) => {
  representante.dataAtualizacao = new Date();
});

export default Representante; 
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IProduto {
  id?: string;
  codigo: string;
  nome: string;
  descricao: string;
  imagem?: string;
  especificacoes: any;
  preco: any;
  precoAVista: number;
  precoAPrazo: number;
  pesoPorMetro: number;
  estoque: any;
  categoria: string;
  tags?: any[];
  dataCadastro?: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProdutoCreationAttributes extends Optional<IProduto, 'id' | 'status' | 'dataCadastro' | 'createdAt' | 'updatedAt'> {}

export class Produto extends Model<IProduto, ProdutoCreationAttributes> implements IProduto {
  public id!: string;
  public codigo!: string;
  public nome!: string;
  public descricao!: string;
  public imagem?: string;
  public especificacoes!: any;
  public preco!: any;
  public precoAVista!: number;
  public precoAPrazo!: number;
  public pesoPorMetro!: number;
  public estoque!: any;
  public categoria!: string;
  public tags?: any[];
  public dataCadastro!: Date;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Produto.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  especificacoes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  preco: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  precoAVista: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  precoAPrazo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  pesoPorMetro: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  estoque: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  dataCadastro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ativo',
  },
}, {
  sequelize,
  tableName: 'produtos',
  timestamps: false,
});

export default Produto; 
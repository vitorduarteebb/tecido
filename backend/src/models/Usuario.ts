import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface IUsuario {
  id?: string;
  email: string;
  senha: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsuarioCreationAttributes extends Optional<IUsuario, 'id' | 'createdAt' | 'updatedAt'> {}

export class Usuario extends Model<IUsuario, UsuarioCreationAttributes> implements IUsuario {
  public id!: string;
  public email!: string;
  public senha!: string;
  public role!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'usuarios',
  timestamps: true,
});

export default Usuario; 
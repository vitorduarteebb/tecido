import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { UserRole } from '../types';

export interface IAdmin {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  role: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminCreationAttributes extends Optional<IAdmin, 'id' | 'role' | 'dataCriacao' | 'dataAtualizacao' | 'createdAt' | 'updatedAt'> {}

export class Admin extends Model<IAdmin, AdminCreationAttributes> implements IAdmin {
  public id!: string;
  public nome!: string;
  public email!: string;
  public senha!: string;
  public role!: string;
  public dataCriacao!: Date;
  public dataAtualizacao!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init({
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
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: UserRole.ADMINISTRADOR,
  },
  dataCriacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  dataAtualizacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'admins',
  timestamps: false,
});

// Hook para atualizar dataAtualizacao
Admin.beforeUpdate((admin: Admin) => {
  admin.dataAtualizacao = new Date();
});

export default Admin; 
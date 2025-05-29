import mongoose, { Document } from 'mongoose';
import { UserRole } from '../types';

export interface IAdmin extends Document {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const adminSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ADMINISTRADOR,
    required: true
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para atualizar a data de atualização
adminSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.dataAtualizacao = new Date();
  }
  next();
});

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin; 
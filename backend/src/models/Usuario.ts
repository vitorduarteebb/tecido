import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';

export interface IUsuario extends Document {
  email: string;
  senha: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const usuarioSchema = new Schema<IUsuario>({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['ADMINISTRADOR', 'REPRESENTANTE', 'CLIENTE'], required: true }
}, {
  timestamps: true
});

export const Usuario = mongoose.model<IUsuario>('Usuario', usuarioSchema); 
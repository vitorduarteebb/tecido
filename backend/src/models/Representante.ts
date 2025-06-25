import mongoose from 'mongoose';

const representanteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  regiao: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Ativo', 'Inativo'],
    default: 'Ativo',
  },
  senha: {
    type: String,
    required: true,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now,
  },
  comissao: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
});

// Middleware para atualizar a data de atualização
representanteSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.dataAtualizacao = new Date();
  }
  next();
});

const Representante = mongoose.model('Representante', representanteSchema);

export default Representante;

// Observação: A relação de clientes vinculados é feita pelo campo 'representantes' no model Cliente. 
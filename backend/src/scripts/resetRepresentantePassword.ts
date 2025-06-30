import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Representante from '../models/Representante';
import { config } from '../config';

async function resetSenha(email: string, novaSenha: string) {
  await mongoose.connect(config.mongoUri);
  const hash = await bcrypt.hash(novaSenha, 10);
  const result = await Representante.findOneAndUpdate(
    { email },
    { senha: hash }
  );
  if (result) {
    console.log('Senha redefinida com sucesso!');
  } else {
    console.log('Representante não encontrado!');
  }
  await mongoose.disconnect();
}

resetSenha('vitorduarteebbg@gmail.com', 'novaSenha123'); 
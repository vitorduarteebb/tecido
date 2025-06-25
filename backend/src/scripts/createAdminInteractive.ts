// src/scripts/createAdminInteractive.ts

import readlineSync from "readline-sync";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Schema, model, Document } from "mongoose";
import dotenv from "dotenv";

// Carrega variáveis de ambiente do .env (caso exista)
dotenv.config();

// Defina uma interface para o Admin
interface IAdmin extends Document {
  nome: string;
  email: string;
  senha: string;
  role: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

// Defina o schema (mapeie os campos conforme seu projeto)
const adminSchema = new Schema<IAdmin>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  role: { type: String, required: true, enum: ["ADMINISTRADOR", "REPRESENTANTE", "CLIENTE"] },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now }
});

// Cria o model
const Admin = model<IAdmin>("Admin", adminSchema);

async function main() {
  try {
    // 1. Pergunta interativa
    console.log("===== Criação de Usuário Administrador =====");
    const email = readlineSync.questionEMail("Informe o e-mail do administrador: ");
    const nome = readlineSync.question("Informe o nome completo do administrador: ");
    const senha = readlineSync.question("Digite a senha: ", { hideEchoBack: true });
    const confirma = readlineSync.question("Confirme a senha: ", { hideEchoBack: true });

    if (senha !== confirma) {
      console.log("\nAs senhas não conferem. Abortando.");
      process.exit(1);
    }

    // 2. Conectar ao MongoDB
    //    Use DATABASE_URL do seu .env ou um padrão
    const mongoUrl = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/tecidos";
    await mongoose.connect(mongoUrl);
    console.log("Conectado ao MongoDB em:", mongoUrl);

    // 3. Verificar se já existe um admin com esse e-mail
    const jaExiste = await Admin.findOne({ email });
    if (jaExiste) {
      console.log(`\nJá existe um administrador com e-mail "${email}". Abortando.`);
      process.exit(0);
    }

    // 4. Criar hash da senha e inserir no banco
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);

    const novoAdmin = new Admin({
      nome,
      email,
      senha: hashSenha,
      role: "ADMINISTRADOR",
      dataCriacao: new Date(),
      dataAtualizacao: new Date()
    });

    await novoAdmin.save();
    console.log("\n✔ Administrador criado com sucesso!");
    console.log(`   • E-mail: ${email}`);
    console.log(`   • Role: ADMINISTRADOR`);
    process.exit(0);
  } catch (err: any) {
    console.error("Erro ao criar admin:", err.message || err);
    process.exit(1);
  }
}

main();

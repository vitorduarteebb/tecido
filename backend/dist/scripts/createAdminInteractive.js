"use strict";
// src/scripts/createAdminInteractive.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_sync_1 = __importDefault(require("readline-sync"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_2 = require("mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
// Carrega variáveis de ambiente do .env (caso exista)
dotenv_1.default.config();
// Defina o schema (mapeie os campos conforme seu projeto)
const adminSchema = new mongoose_2.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: { type: String, required: true, enum: ["ADMINISTRADOR", "REPRESENTANTE", "CLIENTE"] },
    dataCriacao: { type: Date, default: Date.now },
    dataAtualizacao: { type: Date, default: Date.now }
});
// Cria o model
const Admin = (0, mongoose_2.model)("Admin", adminSchema);
async function main() {
    try {
        // 1. Pergunta interativa
        console.log("===== Criação de Usuário Administrador =====");
        const email = readline_sync_1.default.questionEMail("Informe o e-mail do administrador: ");
        const nome = readline_sync_1.default.question("Informe o nome completo do administrador: ");
        const senha = readline_sync_1.default.question("Digite a senha: ", { hideEchoBack: true });
        const confirma = readline_sync_1.default.question("Confirme a senha: ", { hideEchoBack: true });
        if (senha !== confirma) {
            console.log("\nAs senhas não conferem. Abortando.");
            process.exit(1);
        }
        // 2. Conectar ao MongoDB
        //    Use DATABASE_URL do seu .env ou um padrão
        const mongoUrl = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/tecidos";
        await mongoose_1.default.connect(mongoUrl);
        console.log("Conectado ao MongoDB em:", mongoUrl);
        // 3. Verificar se já existe um admin com esse e-mail
        const jaExiste = await Admin.findOne({ email });
        if (jaExiste) {
            console.log(`\nJá existe um administrador com e-mail "${email}". Abortando.`);
            process.exit(0);
        }
        // 4. Criar hash da senha e inserir no banco
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashSenha = await bcryptjs_1.default.hash(senha, salt);
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
    }
    catch (err) {
        console.error("Erro ao criar admin:", err.message || err);
        process.exit(1);
    }
}
main();

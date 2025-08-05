"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Produto_1 = require("../src/models/Produto");
const database_1 = __importDefault(require("../src/config/database"));
async function listProdutos() {
    try {
        await database_1.default.sync();
        const produtos = await Produto_1.Produto.findAll({ attributes: ['id', 'nome', 'preco'] });
        if (produtos.length === 0) {
            console.log('Nenhum produto cadastrado.');
        }
        else {
            produtos.forEach(prod => {
                console.log(`ID: ${prod.id}, Nome: ${prod.nome}, Preço: ${prod.preco}`);
            });
        }
    }
    catch (error) {
        console.error('Erro ao listar produtos:', error);
    }
    finally {
        process.exit(0);
    }
}
listProdutos();

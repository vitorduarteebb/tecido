"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Produto_1 = require("../src/models/Produto");
const database_1 = __importDefault(require("../src/config/database"));
async function createProduto() {
    try {
        await database_1.default.sync();
        const produto = await Produto_1.Produto.create({
            codigo: 'TESTE001',
            nome: 'Tecido Teste',
            descricao: 'Tecido para testes automáticos',
            especificacoes: { cor: 'azul', largura: '1.5m' },
            preco: { metro: 10.5 },
            precoAVista: 10.0,
            precoAPrazo: 12.0,
            pesoPorMetro: 0.2,
            estoque: { metros: 1000 },
            categoria: 'Teste',
            status: 'ativo'
        });
        console.log(`Produto criado! ID: ${produto.id}, Nome: ${produto.nome}, Preço: ${produto.preco.metro}`);
    }
    catch (error) {
        console.error('Erro ao criar produto:', error);
    }
    finally {
        process.exit(0);
    }
}
createProduto();

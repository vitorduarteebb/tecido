"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const XLSX = __importStar(require("xlsx"));
const path = __importStar(require("path"));
const models_1 = require("../models");
const database_1 = require("../config/database");
async function testImportWithoutAuth() {
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        // Testar importação de clientes
        console.log('\n=== TESTANDO IMPORTAÇÃO DE CLIENTES ===');
        const clientesPath = path.join(__dirname, '../../../Clientes exemplo.xls');
        console.log('Lendo arquivo:', clientesPath);
        const clientesWorkbook = XLSX.readFile(clientesPath);
        const clientesSheetName = clientesWorkbook.SheetNames[0];
        const clientesWorksheet = clientesWorkbook.Sheets[clientesSheetName];
        const clientesData = XLSX.utils.sheet_to_json(clientesWorksheet, { header: 1 });
        console.log(`Encontrados ${clientesData.length} linhas no arquivo de clientes`);
        // Procurar a linha de cabeçalho
        const clientesHeaderIndex = clientesData.findIndex(row => row.includes('Razão social'));
        if (clientesHeaderIndex === -1) {
            console.log('❌ Cabeçalho de clientes não encontrado!');
        }
        else {
            console.log('✅ Cabeçalho de clientes encontrado na linha:', clientesHeaderIndex + 1);
        }
        // Testar importação de produtos
        console.log('\n=== TESTANDO IMPORTAÇÃO DE PRODUTOS ===');
        const produtosPath = path.join(__dirname, '../../../produtos exemplo.xlsx');
        console.log('Lendo arquivo:', produtosPath);
        const produtosWorkbook = XLSX.readFile(produtosPath);
        const produtosSheetName = produtosWorkbook.SheetNames[0];
        const produtosWorksheet = produtosWorkbook.Sheets[produtosSheetName];
        const produtosData = XLSX.utils.sheet_to_json(produtosWorksheet, { header: 1 });
        console.log(`Encontrados ${produtosData.length} linhas no arquivo de produtos`);
        // Procurar a linha de cabeçalho
        const produtosHeaderIndex = produtosData.findIndex(row => row.includes('Código do produto\r\n'));
        if (produtosHeaderIndex === -1) {
            console.log('❌ Cabeçalho de produtos não encontrado!');
        }
        else {
            console.log('✅ Cabeçalho de produtos encontrado na linha:', produtosHeaderIndex + 1);
        }
        // Verificar se há dados no banco
        console.log('\n=== VERIFICANDO DADOS NO BANCO ===');
        const clientesCount = await models_1.Cliente.count();
        const produtosCount = await models_1.Produto.count();
        console.log(`Clientes no banco: ${clientesCount}`);
        console.log(`Produtos no banco: ${produtosCount}`);
        process.exit(0);
    }
    catch (error) {
        console.error('Erro geral:', error);
        process.exit(1);
    }
}
testImportWithoutAuth();

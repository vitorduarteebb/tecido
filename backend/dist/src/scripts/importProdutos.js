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
async function importProdutos() {
    var _a, _b, _c, _d;
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        // Caminho para o arquivo Excel
        const filePath = path.join(__dirname, '../../../produtos exemplo.xlsx');
        console.log('Lendo arquivo:', filePath);
        // Ler o arquivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Converter para JSON, incluindo linhas de cabeçalho
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`Encontrados ${data.length} linhas no arquivo`);
        let sucessos = 0;
        let erros = 0;
        let duplicados = 0;
        // Procurar a linha de cabeçalho (onde está "Código do produto")
        const headerIndex = data.findIndex(row => row.includes('Código do produto\r\n'));
        if (headerIndex === -1) {
            console.log('Cabeçalho não encontrado!');
            process.exit(1);
        }
        const header = data[headerIndex];
        // Mapear índices das colunas
        const idx = {
            codigo: header.indexOf('Código do produto\r\n'),
            nome: header.indexOf('Nome do produto\r\n'),
            precoTabela: header.indexOf('Preço de Tabela\r\n'),
            precoAVista: header.indexOf('Tabela a Vista'),
            estoque: header.indexOf('Quantidade em estoque\r\n'),
            pesoPorMetro: header.indexOf('Peso bruto por metro (em Kg)\r\n'),
            categoria: header.indexOf('Categoria principal\r\n'),
            // Outras colunas podem ser mapeadas conforme necessário
        };
        for (let i = headerIndex + 1; i < data.length; i++) {
            const row = data[i];
            // Ignorar linhas vazias
            if (!row[idx.codigo] || !row[idx.nome] || !row[idx.precoTabela]) {
                continue;
            }
            try {
                // Verificar se o código já existe
                const codigo = (_a = row[idx.codigo]) === null || _a === void 0 ? void 0 : _a.toString().trim();
                const produtoExistente = await models_1.Produto.findOne({ where: { codigo } });
                if (produtoExistente) {
                    duplicados++;
                    continue;
                }
                // Montar campos
                await models_1.Produto.create({
                    codigo,
                    nome: (_b = row[idx.nome]) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    descricao: (_c = row[idx.nome]) === null || _c === void 0 ? void 0 : _c.toString().trim(),
                    especificacoes: {},
                    preco: {
                        tabela: parseFloat(row[idx.precoTabela]) || 0,
                        aVista: parseFloat(row[idx.precoAVista]) || 0
                    },
                    precoAVista: parseFloat(row[idx.precoAVista]) || 0,
                    precoAPrazo: parseFloat(row[idx.precoTabela]) || 0,
                    pesoPorMetro: parseFloat(row[idx.pesoPorMetro]) || 0,
                    estoque: {
                        quantidade: parseFloat(row[idx.estoque]) || 0,
                        unidade: 'metros'
                    },
                    categoria: ((_d = row[idx.categoria]) === null || _d === void 0 ? void 0 : _d.toString().trim()) || 'Geral',
                    tags: [],
                    status: 'ativo'
                });
                sucessos++;
            }
            catch (error) {
                console.error(`Linha ${i + 1}: Erro ao importar produto:`, error);
                erros++;
            }
        }
        console.log('\n=== RESUMO DA IMPORTAÇÃO ===');
        console.log(`Total de registros: ${data.length - headerIndex - 1}`);
        console.log(`Importados com sucesso: ${sucessos}`);
        console.log(`Duplicados (ignorados): ${duplicados}`);
        console.log(`Erros: ${erros}`);
        process.exit(0);
    }
    catch (error) {
        console.error('Erro geral:', error);
        process.exit(1);
    }
}
importProdutos();

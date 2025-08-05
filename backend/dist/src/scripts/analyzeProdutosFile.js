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
async function analyzeProdutosFile() {
    try {
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
        console.log('\n=== ESTRUTURA DO ARQUIVO ===');
        // Mostrar as primeiras 5 linhas
        for (let i = 0; i < Math.min(5, data.length); i++) {
            console.log(`Linha ${i + 1}:`, data[i]);
        }
        // Procurar por diferentes possíveis cabeçalhos
        const possibleHeaders = [
            'Código do produto',
            'Código do produto\r\n',
            'Nome do produto',
            'Nome do produto\r\n',
            'Preço de Tabela',
            'Preço de Tabela\r\n',
            'Quantidade em estoque',
            'Quantidade em estoque\r\n'
        ];
        console.log('\n=== PROCURANDO CABEÇALHOS ===');
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (Array.isArray(row)) {
                for (const header of possibleHeaders) {
                    if (row.includes(header)) {
                        console.log(`Cabeçalho "${header}" encontrado na linha ${i + 1}`);
                        console.log('Linha completa:', row);
                    }
                }
            }
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Erro geral:', error);
        process.exit(1);
    }
}
analyzeProdutosFile();

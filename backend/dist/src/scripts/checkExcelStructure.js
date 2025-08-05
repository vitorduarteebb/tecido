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
function checkExcelStructure(filePath, fileName) {
    try {
        console.log(`\n=== Verificando estrutura do arquivo: ${fileName} ===`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log(`Planilha encontrada: ${sheetName}`);
        // Converter para JSON
        const data = XLSX.utils.sheet_to_json(worksheet);
        console.log(`Total de registros: ${data.length}`);
        if (data.length > 0) {
            console.log('\nPrimeiro registro:');
            console.log(JSON.stringify(data[0], null, 2));
            console.log('\nColunas encontradas:');
            const columns = Object.keys(data[0]);
            columns.forEach((col, index) => {
                console.log(`${index + 1}. ${col}`);
            });
        }
        // Verificar primeiras linhas
        console.log('\nPrimeiras 3 linhas:');
        for (let i = 0; i < Math.min(3, data.length); i++) {
            console.log(`Linha ${i + 1}:`, data[i]);
        }
    }
    catch (error) {
        console.error(`Erro ao ler arquivo ${fileName}:`, error);
    }
}
// Verificar arquivo de clientes
const clientesPath = path.join(__dirname, '../../../Clientes exemplo.xls');
checkExcelStructure(clientesPath, 'Clientes exemplo.xls');
// Verificar arquivo de produtos
const produtosPath = path.join(__dirname, '../../../produtos exemplo.xlsx');
checkExcelStructure(produtosPath, 'produtos exemplo.xlsx');

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
async function importClientes() {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        await database_1.sequelize.authenticate();
        console.log('Conectado ao banco de dados');
        // Caminho para o arquivo Excel
        const filePath = path.join(__dirname, '../../../Clientes exemplo.xls');
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
        // Procurar a linha de cabeçalho (onde está "Razão social")
        const headerIndex = data.findIndex(row => row.includes('Razão social'));
        if (headerIndex === -1) {
            console.log('Cabeçalho não encontrado!');
            process.exit(1);
        }
        const header = data[headerIndex];
        // Mapear índices das colunas
        const idx = {
            razaoSocial: header.indexOf('Razão social'),
            nomeFantasia: header.indexOf('Nome fantasia'),
            cnpj: header.indexOf('CNPJ/CPF'),
            inscricaoEstadual: header.indexOf('Inscrição Estadual'),
            telefone: header.indexOf('Telefones'),
            email: header.indexOf('E-mails'),
            endereco: header.indexOf('Endereço principal'),
            bairro: header.indexOf('Bairro'),
            cidade: header.indexOf('Cidade'),
            estado: header.indexOf('Estado'),
            cep: header.indexOf('CEP'),
            contato: header.indexOf('Contato'),
        };
        for (let i = headerIndex + 1; i < data.length; i++) {
            const row = data[i];
            // Ignorar linhas vazias
            if (!row[idx.razaoSocial] || !row[idx.cnpj] || !row[idx.email] || !row[idx.telefone]) {
                continue;
            }
            try {
                // Verificar se o CNPJ já existe
                const cnpj = (_a = row[idx.cnpj]) === null || _a === void 0 ? void 0 : _a.toString().replace(/\D/g, '');
                const clienteExistente = await models_1.Cliente.findOne({ where: { cnpj } });
                if (clienteExistente) {
                    duplicados++;
                    continue;
                }
                // Montar endereço
                const endereco = {
                    endereco: row[idx.endereco] || '',
                    bairro: row[idx.bairro] || '',
                    cidade: row[idx.cidade] || '',
                    estado: row[idx.estado] || '',
                    cep: row[idx.cep] || '',
                    contato: row[idx.contato] || ''
                };
                await models_1.Cliente.create({
                    razaoSocial: (_b = row[idx.razaoSocial]) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    nomeFantasia: ((_c = row[idx.nomeFantasia]) === null || _c === void 0 ? void 0 : _c.toString().trim()) || ((_d = row[idx.razaoSocial]) === null || _d === void 0 ? void 0 : _d.toString().trim()),
                    cnpj,
                    inscricaoEstadual: ((_e = row[idx.inscricaoEstadual]) === null || _e === void 0 ? void 0 : _e.toString().trim()) || 'ISENTO',
                    email: (_f = row[idx.email]) === null || _f === void 0 ? void 0 : _f.toString().trim().toLowerCase(),
                    telefone: (_g = row[idx.telefone]) === null || _g === void 0 ? void 0 : _g.toString().trim(),
                    endereco,
                    status: 'ativo',
                });
                sucessos++;
            }
            catch (error) {
                console.error(`Linha ${i + 1}: Erro ao importar cliente:`, error);
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
importClientes();

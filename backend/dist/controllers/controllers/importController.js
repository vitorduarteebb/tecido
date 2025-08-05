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
exports.importProdutos = exports.importClientes = void 0;
const XLSX = __importStar(require("xlsx"));
const models_1 = require("../models");
const importClientes = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        let sucessos = 0;
        let erros = 0;
        let duplicados = 0;
        const errosDetalhados = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Validar dados obrigatórios
                if (!row['Razão Social'] || !row['CNPJ'] || !row['Email'] || !row['Telefone']) {
                    errosDetalhados.push(`Linha ${i + 2}: Dados obrigatórios faltando`);
                    erros++;
                    continue;
                }
                // Verificar se o CNPJ já existe
                const clienteExistente = await models_1.Cliente.findOne({
                    where: { cnpj: (_a = row['CNPJ']) === null || _a === void 0 ? void 0 : _a.toString().replace(/\D/g, '') }
                });
                if (clienteExistente) {
                    duplicados++;
                    continue;
                }
                // Preparar endereço
                const endereco = {
                    endereco: row['Endereço'] || '',
                    cidade: row['Cidade'] || '',
                    estado: row['Estado'] || '',
                    cep: row['CEP'] || ''
                };
                // Criar cliente
                await models_1.Cliente.create({
                    razaoSocial: (_b = row['Razão Social']) === null || _b === void 0 ? void 0 : _b.toString().trim(),
                    nomeFantasia: ((_c = row['Nome Fantasia']) === null || _c === void 0 ? void 0 : _c.toString().trim()) || ((_d = row['Razão Social']) === null || _d === void 0 ? void 0 : _d.toString().trim()),
                    cnpj: (_e = row['CNPJ']) === null || _e === void 0 ? void 0 : _e.toString().replace(/\D/g, ''),
                    inscricaoEstadual: ((_f = row['Inscrição Estadual']) === null || _f === void 0 ? void 0 : _f.toString().trim()) || 'ISENTO',
                    email: (_g = row['Email']) === null || _g === void 0 ? void 0 : _g.toString().trim().toLowerCase(),
                    telefone: (_h = row['Telefone']) === null || _h === void 0 ? void 0 : _h.toString().trim(),
                    celular: ((_j = row['Celular']) === null || _j === void 0 ? void 0 : _j.toString().trim()) || undefined,
                    endereco: endereco,
                    status: 'ativo',
                    representantes: ((_k = row['Representantes']) === null || _k === void 0 ? void 0 : _k.toString().trim()) || undefined
                });
                sucessos++;
            }
            catch (error) {
                errosDetalhados.push(`Linha ${i + 2}: ${error}`);
                erros++;
            }
        }
        res.json({
            message: 'Importação concluída',
            total: data.length,
            sucessos,
            duplicados,
            erros,
            errosDetalhados
        });
    }
    catch (error) {
        console.error('Erro na importação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.importClientes = importClientes;
const importProdutos = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Converter para JSON, incluindo linhas de cabeçalho
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        let sucessos = 0;
        let erros = 0;
        let duplicados = 0;
        const errosDetalhados = [];
        // Procurar a linha de cabeçalho
        const headerIndex = data.findIndex(row => row && row.some((cell) => cell && cell.toString().toLowerCase().includes('código do produto')));
        if (headerIndex === -1) {
            return res.status(400).json({ error: 'Cabeçalho não encontrado no arquivo' });
        }
        const header = data[headerIndex];
        // Mapear índices das colunas
        const idx = {
            codigo: header.findIndex((cell) => cell && cell.toString().includes('Código do produto')),
            nome: header.findIndex((cell) => cell && cell.toString().includes('Nome do produto')),
            precoTabela: header.findIndex((cell) => cell && cell.toString().includes('Preço de Tabela')),
            precoAVista: header.findIndex((cell) => cell && cell.toString().includes('Tabela a Vista')),
            comissao: header.findIndex((cell) => cell && cell.toString().includes('Comissão')),
            unidade: header.findIndex((cell) => cell && cell.toString().includes('Unidade')),
            estoque: header.findIndex((cell) => cell && cell.toString().includes('Quantidade em estoque')),
            pesoPorMetro: header.findIndex((cell) => cell && cell.toString().includes('Peso bruto por metro')),
            categoria: header.findIndex((cell) => cell && cell.toString().includes('Categoria principal')),
            subcategoria: header.findIndex((cell) => cell && cell.toString().includes('Subcategoria'))
        };
        // Processar linhas de dados
        for (let i = headerIndex + 1; i < data.length; i++) {
            const row = data[i];
            try {
                // Ignorar linhas vazias
                if (!row || !row[idx.codigo] || !row[idx.nome] || !row[idx.precoTabela]) {
                    continue;
                }
                const codigo = (_a = row[idx.codigo]) === null || _a === void 0 ? void 0 : _a.toString().trim();
                const nome = (_b = row[idx.nome]) === null || _b === void 0 ? void 0 : _b.toString().trim();
                const precoTabela = parseFloat(row[idx.precoTabela]) || 0;
                const precoAVista = parseFloat(row[idx.precoAVista]) || precoTabela;
                // Verificar se o código já existe
                const produtoExistente = await models_1.Produto.findOne({
                    where: { codigo }
                });
                if (produtoExistente) {
                    duplicados++;
                    continue;
                }
                // Preparar especificações
                const especificacoes = {
                    descricao: nome,
                    composicao: '',
                    largura: '',
                    gramatura: '',
                    comissao: parseFloat(row[idx.comissao]) || 0,
                    unidade: ((_c = row[idx.unidade]) === null || _c === void 0 ? void 0 : _c.toString().trim()) || 'Metros'
                };
                // Preparar preço
                const preco = {
                    tabela: precoTabela,
                    aVista: precoAVista,
                    aPrazo: precoTabela
                };
                // Preparar estoque
                const estoque = {
                    quantidade: parseFloat(row[idx.estoque]) || 0,
                    unidade: ((_d = row[idx.unidade]) === null || _d === void 0 ? void 0 : _d.toString().trim()) || 'Metros'
                };
                // Preparar categoria e tags
                const categoria = ((_e = row[idx.categoria]) === null || _e === void 0 ? void 0 : _e.toString().trim()) || 'Geral';
                const subcategoria = (_f = row[idx.subcategoria]) === null || _f === void 0 ? void 0 : _f.toString().trim();
                const tags = subcategoria ? [subcategoria] : [];
                // Criar produto
                await models_1.Produto.create({
                    codigo,
                    nome,
                    descricao: nome,
                    especificacoes,
                    preco,
                    precoAVista,
                    precoAPrazo: precoTabela,
                    pesoPorMetro: parseFloat(row[idx.pesoPorMetro]) || 0,
                    estoque,
                    categoria,
                    tags,
                    status: 'ativo'
                });
                sucessos++;
            }
            catch (error) {
                errosDetalhados.push(`Linha ${i + 1}: ${error}`);
                erros++;
            }
        }
        res.json({
            message: 'Importação concluída',
            total: data.length - headerIndex - 1,
            sucessos,
            duplicados,
            erros,
            errosDetalhados
        });
    }
    catch (error) {
        console.error('Erro na importação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
exports.importProdutos = importProdutos;

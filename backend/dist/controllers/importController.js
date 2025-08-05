"use strict";
var __importStar = (this && this.__importStar) || (function () {
    var __values = (this && this.__values) || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator && o[Symbol.iterator], i = 0;
        return s ? s.call(o) : {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importProdutos = exports.importClientes = void 0;
const XLSX = __importStar(require("xlsx"));
const models_1 = require("../models");
const importClientes = async (req, res) => {
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
                    where: { cnpj: row['CNPJ']?.toString().replace(/\D/g, '') }
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
                    razaoSocial: row['Razão Social']?.toString().trim(),
                    nomeFantasia: row['Nome Fantasia']?.toString().trim() || row['Razão Social']?.toString().trim(),
                    cnpj: row['CNPJ']?.toString().replace(/\D/g, ''),
                    inscricaoEstadual: row['Inscrição Estadual']?.toString().trim() || 'ISENTO',
                    email: row['Email']?.toString().trim().toLowerCase(),
                    telefone: row['Telefone']?.toString().trim(),
                    celular: row['Celular']?.toString().trim() || undefined,
                    endereco: endereco,
                    status: 'ativo',
                    representantes: row['Representantes']?.toString().trim() || undefined
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
        const headerIndex = data.findIndex(row => 
            row && row.some((cell) => 
                cell && cell.toString().toLowerCase().includes('código do produto')
            )
        );
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
                const codigo = row[idx.codigo]?.toString().trim();
                const nome = row[idx.nome]?.toString().trim();
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
                    unidade: row[idx.unidade]?.toString().trim() || 'Metros'
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
                    unidade: row[idx.unidade]?.toString().trim() || 'Metros'
                };
                // Preparar categoria e tags
                const categoria = row[idx.categoria]?.toString().trim() || 'Geral';
                const subcategoria = row[idx.subcategoria]?.toString().trim();
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
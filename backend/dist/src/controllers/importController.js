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
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        const workbook = XLSX.read(req.file.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // SEMPRE usar array de arrays para preservar a estrutura real
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('=== IMPORTAÇÃO CLIENTES ===');
        console.log(`Total de linhas no arquivo: ${rawData.length}`);
        // Procurar a linha de cabeçalho (que contém "Razão social" ou similar)
        let headerRowIndex = -1;
        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];
            if (row && row.some((cell) => cell && cell.toString().toLowerCase().includes('razão social') ||
                cell && cell.toString().toLowerCase().includes('razao social') ||
                cell && cell.toString().toLowerCase().includes('cnpj'))) {
                headerRowIndex = i;
                break;
            }
        }
        if (headerRowIndex === -1) {
            return res.status(400).json({ error: 'Cabeçalho não encontrado no arquivo' });
        }
        console.log(`Cabeçalho encontrado na linha ${headerRowIndex + 1}`);
        console.log('Campos detectados:', rawData[headerRowIndex]);
        let sucessos = 0;
        let erros = 0;
        let duplicados = 0;
        const errosDetalhados = [];
        // SEMPRE processar usando array de arrays (estrutura real)
        const header = rawData[headerRowIndex];
        console.log('Processando estrutura array de arrays');
        console.log('Cabeçalho detectado:', header);
        // Mapear índices das colunas baseado na estrutura real
        const columnIndexes = {
            razaoSocial: 0, // "Razão social" está na posição 0
            nomeFantasia: 1, // "Nome fantasia" está na posição 1
            cnpj: 2, // "CNPJ/CPF" está na posição 2
            inscricaoEstadual: 3, // "Inscrição Estadual" está na posição 3
            telefone: 4, // "Telefones" está na posição 4
            email: 5, // "E-mails" está na posição 5
            endereco: 6, // "Endereço principal" está na posição 6
            bairro: 7, // "Bairro" está na posição 7
            cidade: 8, // "Cidade" está na posição 8
            estado: 9, // "Estado" está na posição 9
            cep: 10, // "CEP" está na posição 10
            contato: 11 // "Contato" está na posição 11
        };
        console.log('Mapeamento fixo baseado na estrutura real:', columnIndexes);
        console.log(`Processando ${rawData.length - headerRowIndex - 1} linhas de dados...`);
        // Processar linhas de dados (apenas as linhas com dados reais)
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0)
                continue;
            try {
                // Extrair dados usando mapeamento fixo baseado na estrutura real
                const razaoSocial = row[columnIndexes.razaoSocial];
                const nomeFantasia = row[columnIndexes.nomeFantasia];
                const cnpj = row[columnIndexes.cnpj];
                const inscricaoEstadual = row[columnIndexes.inscricaoEstadual];
                const telefone = row[columnIndexes.telefone];
                const email = row[columnIndexes.email];
                const endereco = row[columnIndexes.endereco];
                const bairro = row[columnIndexes.bairro];
                const cidade = row[columnIndexes.cidade];
                const estado = row[columnIndexes.estado];
                const cep = row[columnIndexes.cep];
                const contato = row[columnIndexes.contato];
                console.log(`\n=== PROCESSANDO LINHA ${i + 1} ===`);
                console.log('Dados extraídos:', {
                    razaoSocial,
                    nomeFantasia,
                    cnpj,
                    telefone,
                    email
                });
                // Validar dados obrigatórios
                if (!razaoSocial) {
                    console.log('ERRO: Razão Social está vazia');
                    errosDetalhados.push(`Linha ${i + 1}: Razão Social obrigatória está faltando`);
                    erros++;
                    continue;
                }
                console.log(`✅ Processando cliente: ${razaoSocial}`);
                // Verificar se o CNPJ já existe
                if (cnpj) {
                    const clienteExistente = await models_1.Cliente.findOne({
                        where: { cnpj: cnpj.toString().replace(/\D/g, '') }
                    });
                    if (clienteExistente) {
                        console.log(`Cliente ${razaoSocial} já existe com CNPJ ${cnpj}`);
                        duplicados++;
                        continue;
                    }
                }
                // Preparar endereço
                const enderecoCompleto = {
                    endereco: endereco || '',
                    cidade: cidade || '',
                    estado: estado || '',
                    cep: cep || ''
                };
                console.log('Criando cliente com dados:', {
                    razaoSocial: razaoSocial.toString().trim(),
                    cnpj: cnpj ? cnpj.toString().replace(/\D/g, '') : '00000000000000',
                    email: email ? email.toString().trim().toLowerCase() : `temp_${Date.now()}@example.com`,
                    telefone: telefone ? telefone.toString().trim() : '(00) 00000-0000'
                });
                // NOVA FUNCIONALIDADE: Se o usuário logado for um representante, 
                // automaticamente atribui o cliente a ele
                let representantesFinal = contato ? contato.toString().trim() || undefined : undefined;
                if (req.user && req.user.role === 'REPRESENTANTE') {
                    // Representante logado - atribui automaticamente a ele
                    representantesFinal = req.user.id;
                    console.log(`[importController] Representante ${req.user.id} importando cliente - atribuindo automaticamente`);
                }
                // Criar cliente
                await models_1.Cliente.create({
                    razaoSocial: razaoSocial.toString().trim(),
                    nomeFantasia: nomeFantasia ? nomeFantasia.toString().trim() : razaoSocial.toString().trim(),
                    cnpj: cnpj ? cnpj.toString().replace(/\D/g, '') : '00000000000000',
                    inscricaoEstadual: inscricaoEstadual ? inscricaoEstadual.toString().trim() : 'ISENTO',
                    email: email ? email.toString().trim().toLowerCase() : `temp_${Date.now()}@example.com`,
                    telefone: telefone ? telefone.toString().trim() : '(00) 00000-0000',
                    celular: undefined, // Não há campo específico no arquivo atual
                    endereco: enderecoCompleto,
                    status: 'ativo',
                    representantes: representantesFinal
                });
                sucessos++;
            }
            catch (error) {
                errosDetalhados.push(`Linha ${i + 1}: ${error}`);
                erros++;
            }
        }
        const totalProcessed = Math.max(0, rawData.length - headerRowIndex - 1);
        res.json({
            message: 'Importação concluída',
            total: totalProcessed,
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

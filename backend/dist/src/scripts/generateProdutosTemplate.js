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
async function generateProdutosTemplate() {
    try {
        // Dados do template
        const templateData = [
            [
                'Código do produto',
                'Nome do produto',
                'Preço de Tabela',
                'Comissão',
                'Unidade',
                'Quantidade em estoque',
                'Peso bruto por metro (em Kg)',
                'Categoria principal',
                'Subcategoria',
                'Tabela a Vista'
            ],
            [
                '13206',
                'Tricoline 13206 Gatinhos',
                24.8,
                5,
                'Metros',
                5.85,
                0.18,
                'Tricoline Digital',
                '',
                23.6
            ],
            [
                '13226',
                'Tricoline Pandinhas',
                24.8,
                5,
                'Metros',
                74.65,
                0.18,
                'Tricoline Digital',
                '',
                23.6
            ],
            [
                '13219',
                'Tricoline Papai Noel',
                24.8,
                5,
                'Metros',
                0,
                0.18,
                'Tricoline Digital',
                'Natal',
                23.6
            ]
        ];
        // Criar workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(templateData);
        // Ajustar largura das colunas
        const colWidths = [
            { wch: 15 }, // Código do produto
            { wch: 30 }, // Nome do produto
            { wch: 15 }, // Preço de Tabela
            { wch: 10 }, // Comissão
            { wch: 10 }, // Unidade
            { wch: 20 }, // Quantidade em estoque
            { wch: 25 }, // Peso bruto por metro
            { wch: 20 }, // Categoria principal
            { wch: 15 }, // Subcategoria
            { wch: 15 } // Tabela a Vista
        ];
        worksheet['!cols'] = colWidths;
        // Adicionar planilha ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
        // Salvar arquivo
        const outputPath = path.join(__dirname, '../../../template_produtos.xlsx');
        XLSX.writeFile(workbook, outputPath);
        console.log('✅ Template de produtos gerado com sucesso!');
        console.log(`📁 Arquivo salvo em: ${outputPath}`);
        console.log('\n📋 ESTRUTURA DO TEMPLATE:');
        console.log('==========================');
        console.log('1. Código do produto (obrigatório)');
        console.log('2. Nome do produto (obrigatório)');
        console.log('3. Preço de Tabela (obrigatório)');
        console.log('4. Comissão (%)');
        console.log('5. Unidade (Metros, etc.)');
        console.log('6. Quantidade em estoque');
        console.log('7. Peso bruto por metro (em Kg)');
        console.log('8. Categoria principal');
        console.log('9. Subcategoria (opcional)');
        console.log('10. Tabela a Vista (preço à vista)');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro ao gerar template:', error);
        process.exit(1);
    }
}
generateProdutosTemplate();

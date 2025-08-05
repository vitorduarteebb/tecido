import * as XLSX from 'xlsx';
import * as path from 'path';

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
      { wch: 15 }  // Tabela a Vista
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
  } catch (error) {
    console.error('❌ Erro ao gerar template:', error);
    process.exit(1);
  }
}

generateProdutosTemplate(); 
import { Produto } from '../models';
import { sequelize } from '../config/database';

async function listProdutosImportados() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');
    
    const produtos = await Produto.findAll({
      order: [['codigo', 'ASC']]
    });
    
    console.log(`\n📦 PRODUTOS IMPORTADOS (${produtos.length} total)`);
    console.log('=====================================');
    
    produtos.forEach((produto, index) => {
      console.log(`\n${index + 1}. ${produto.codigo} - ${produto.nome}`);
      console.log(`   Categoria: ${produto.categoria}`);
      console.log(`   Preço Tabela: R$ ${produto.preco.tabela}`);
      console.log(`   Preço à Vista: R$ ${produto.precoAVista}`);
      console.log(`   Estoque: ${produto.estoque.quantidade} ${produto.estoque.unidade}`);
      console.log(`   Peso por Metro: ${produto.pesoPorMetro} kg`);
      console.log(`   Comissão: ${produto.especificacoes.comissao}%`);
      console.log(`   Tags: ${produto.tags?.join(', ') || 'Nenhuma'}`);
      console.log('   ---');
    });
    
    // Estatísticas
    const categorias = produtos.reduce((acc, produto) => {
      acc[produto.categoria] = (acc[produto.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📊 ESTATÍSTICAS:');
    console.log('==================');
    Object.entries(categorias).forEach(([categoria, quantidade]) => {
      console.log(`${categoria}: ${quantidade} produtos`);
    });
    
    const totalEstoque = produtos.reduce((acc, produto) => acc + produto.estoque.quantidade, 0);
    console.log(`\nTotal em estoque: ${totalEstoque} metros`);
    
    const valorTotalEstoque = produtos.reduce((acc, produto) => 
      acc + (produto.preco.tabela * produto.estoque.quantidade), 0
    );
    console.log(`Valor total do estoque: R$ ${valorTotalEstoque.toFixed(2)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

listProdutosImportados(); 
import { sequelize } from '../models';
import { Admin, Representante, Cliente, Usuario, Produto, Pedido, MovimentacaoEstoque } from '../models';
import bcrypt from 'bcryptjs';

async function populateDatabase() {
  try {
    console.log('🚀 Iniciando populacao do banco de dados...');

    // 1. Criar Representantes
    console.log('📋 Criando representantes...');
    const representante1 = await Representante.create({
      nome: 'Joao Silva',
      email: 'joao.silva@tecidos.com',
      senha: await bcrypt.hash('123456', 10),
      telefone: '(11) 99999-1111',
      regiao: 'Sao Paulo',
      comissao: 5.0
    });

    const representante2 = await Representante.create({
      nome: 'Maria Santos',
      email: 'maria.santos@tecidos.com',
      senha: await bcrypt.hash('123456', 10),
      telefone: '(11) 99999-2222',
      regiao: 'Rio de Janeiro',
      comissao: 7.5
    });

    // 2. Criar Usuarios Cliente
    console.log('👤 Criando usuarios cliente...');
    const usuario1 = await Usuario.create({
      email: 'cliente1@email.com',
      senha: await bcrypt.hash('123456', 10),
      role: 'CLIENTE'
    });

    const usuario2 = await Usuario.create({
      email: 'cliente2@email.com',
      senha: await bcrypt.hash('123456', 10),
      role: 'CLIENTE'
    });

    // 3. Criar Clientes
    console.log('🏢 Criando clientes...');
    const cliente1 = await Cliente.create({
      razaoSocial: 'Empresa ABC Ltda',
      nomeFantasia: 'ABC Tecidos',
      cnpj: '12.345.678/0001-90',
      inscricaoEstadual: '123456789',
      telefone: '(11) 3333-4444',
      celular: '(11) 99999-3333',
      email: 'contato@abc.com',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 1',
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      usuario: usuario1.id
    });

    const cliente2 = await Cliente.create({
      razaoSocial: 'Comercio XYZ Ltda',
      nomeFantasia: 'XYZ Moda',
      cnpj: '98.765.432/0001-10',
      inscricaoEstadual: '987654321',
      telefone: '(11) 5555-6666',
      celular: '(11) 99999-4444',
      email: 'vendas@xyz.com',
      endereco: {
        logradouro: 'Av. Paulista',
        numero: '1000',
        complemento: 'Andar 10',
        bairro: 'Bela Vista',
        cidade: 'Sao Paulo',
        estado: 'SP',
        cep: '01310-100'
      },
      usuario: usuario2.id
    });

    // 4. Criar Produtos
    console.log('🧵 Criando produtos...');
    const produto1 = await Produto.create({
      nome: 'Tecido Algodao 100%',
      descricao: 'Tecido de algodao puro, ideal para camisetas',
      categoria: 'Algodao',
      codigo: 'ALG001',
      especificacoes: {
        cor: 'Branco',
        tamanho: '1.50m x 50m',
        material: '100% Algodao'
      },
      preco: {
        avista: 25.90,
        aprazo: 28.50
      },
      precoAVista: 25.90,
      precoAPrazo: 28.50,
      pesoPorMetro: 0.2,
      estoque: {
        quantidade: 100,
        unidade: 'metros'
      }
    });

    const produto2 = await Produto.create({
      nome: 'Tecido Poliester',
      descricao: 'Tecido sintetico resistente',
      categoria: 'Sintetico',
      codigo: 'POL002',
      especificacoes: {
        cor: 'Azul',
        tamanho: '2.00m x 50m',
        material: '100% Poliester'
      },
      preco: {
        avista: 18.50,
        aprazo: 20.35
      },
      precoAVista: 18.50,
      precoAPrazo: 20.35,
      pesoPorMetro: 0.15,
      estoque: {
        quantidade: 75,
        unidade: 'metros'
      }
    });

    const produto3 = await Produto.create({
      nome: 'Tecido Elastano',
      descricao: 'Tecido com elastano para roupas esportivas',
      categoria: 'Esportivo',
      codigo: 'ELA003',
      especificacoes: {
        cor: 'Preto',
        tamanho: '1.80m x 50m',
        material: '95% Poliester, 5% Elastano'
      },
      preco: {
        avista: 32.00,
        aprazo: 35.20
      },
      precoAVista: 32.00,
      precoAPrazo: 35.20,
      pesoPorMetro: 0.25,
      estoque: {
        quantidade: 50,
        unidade: 'metros'
      }
    });

    // 5. Criar Pedidos
    console.log('📦 Criando pedidos...');
    const pedido1 = await Pedido.create({
      clienteId: cliente1.id,
      representanteId: representante1.id,
      data: new Date('2025-01-15'),
      status: 'Em Separação',
      valorTotal: 129.50,
      condicaoPagamento: 'avista',
      pesoTotal: 15.5,
      observacoes: 'Entrega urgente',
      itens: [
        {
          produtoId: produto1.id,
          quantidade: 3,
          valorUnitario: 25.90,
          valorTotal: 77.70
        },
        {
          produtoId: produto2.id,
          quantidade: 2,
          valorUnitario: 18.50,
          valorTotal: 37.00
        }
      ]
    });

    const pedido2 = await Pedido.create({
      clienteId: cliente2.id,
      representanteId: representante2.id,
      data: new Date('2025-01-20'),
      status: 'Aguardando Estoque',
      valorTotal: 160.00,
      condicaoPagamento: 'aprazo',
      pesoTotal: 12.5,
      observacoes: 'Pedido especial',
      itens: [
        {
          produtoId: produto3.id,
          quantidade: 5,
          valorUnitario: 32.00,
          valorTotal: 160.00
        }
      ]
    });

    // 6. Criar Movimentacoes de Estoque
    console.log('📊 Criando movimentacoes de estoque...');
    await MovimentacaoEstoque.create({
      produto: produto1.id,
      tipo: 'entrada',
      quantidade: 100,
      data: new Date('2025-01-01'),
      observacoes: 'Estoque inicial'
    });

    await MovimentacaoEstoque.create({
      produto: produto2.id,
      tipo: 'entrada',
      quantidade: 75,
      data: new Date('2025-01-01'),
      observacoes: 'Estoque inicial'
    });

    await MovimentacaoEstoque.create({
      produto: produto3.id,
      tipo: 'entrada',
      quantidade: 50,
      data: new Date('2025-01-01'),
      observacoes: 'Estoque inicial'
    });

    console.log('✅ Banco de dados populado com sucesso!');
    console.log('');
    console.log('📋 Dados criados:');
    console.log('- 2 Representantes');
    console.log('- 2 Clientes');
    console.log('- 3 Produtos');
    console.log('- 2 Pedidos');
    console.log('- 3 Movimentacoes de estoque');
    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('Admin: admin@tecidos.com / admin123');
    console.log('Representante 1: joao.silva@tecidos.com / 123456');
    console.log('Representante 2: maria.santos@tecidos.com / 123456');
    console.log('Cliente 1: cliente1@email.com / 123456');
    console.log('Cliente 2: cliente2@email.com / 123456');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
  } finally {
    await sequelize.close();
  }
}

populateDatabase(); 
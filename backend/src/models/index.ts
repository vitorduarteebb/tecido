import { sequelize } from '../config/database';
import Admin from './Admin';
import Cliente from './Cliente';
import MovimentacaoEstoque from './MovimentacaoEstoque';
import Orcamento from './Orcamento';
import Pedido from './Pedido';
import Produto from './Produto';
import Representante from './Representante';
import Usuario from './Usuario';

// Definir associações
// Cliente -> Pedido (1:N)
Cliente.hasMany(Pedido, { foreignKey: 'clienteId', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Representante -> Pedido (1:N)
Representante.hasMany(Pedido, { foreignKey: 'representanteId', as: 'pedidos' });
Pedido.belongsTo(Representante, { foreignKey: 'representanteId', as: 'representante' });

// Produto -> Pedido (N:N através de itens JSON)
// Produto -> MovimentacaoEstoque (1:N)
Produto.hasMany(MovimentacaoEstoque, { foreignKey: 'produtoId', as: 'movimentacoes' });
MovimentacaoEstoque.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

// Cliente -> Orcamento (1:N)
Cliente.hasMany(Orcamento, { foreignKey: 'clienteId', as: 'orcamentos' });
Orcamento.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });

// Representante -> Orcamento (1:N)
Representante.hasMany(Orcamento, { foreignKey: 'representanteId', as: 'orcamentos' });
Orcamento.belongsTo(Representante, { foreignKey: 'representanteId', as: 'representante' });

// Produto -> Orcamento (1:N)
Produto.hasMany(Orcamento, { foreignKey: 'produtoId', as: 'orcamentos' });
Orcamento.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

export {
  sequelize,
  Admin,
  Cliente,
  MovimentacaoEstoque,
  Orcamento,
  Pedido,
  Produto,
  Representante,
  Usuario,
}; 
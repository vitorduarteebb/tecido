"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = exports.Representante = exports.Produto = exports.Pedido = exports.Orcamento = exports.MovimentacaoEstoque = exports.Cliente = exports.Admin = exports.sequelize = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
const Admin_1 = __importDefault(require("./Admin"));
exports.Admin = Admin_1.default;
const Cliente_1 = __importDefault(require("./Cliente"));
exports.Cliente = Cliente_1.default;
const MovimentacaoEstoque_1 = __importDefault(require("./MovimentacaoEstoque"));
exports.MovimentacaoEstoque = MovimentacaoEstoque_1.default;
const Orcamento_1 = __importDefault(require("./Orcamento"));
exports.Orcamento = Orcamento_1.default;
const Pedido_1 = __importDefault(require("./Pedido"));
exports.Pedido = Pedido_1.default;
const Produto_1 = __importDefault(require("./Produto"));
exports.Produto = Produto_1.default;
const Representante_1 = __importDefault(require("./Representante"));
exports.Representante = Representante_1.default;
const Usuario_1 = __importDefault(require("./Usuario"));
exports.Usuario = Usuario_1.default;
// Definir associações
// Cliente -> Pedido (1:N)
Cliente_1.default.hasMany(Pedido_1.default, { foreignKey: 'clienteId', as: 'pedidos' });
Pedido_1.default.belongsTo(Cliente_1.default, { foreignKey: 'clienteId', as: 'cliente' });
// Representante -> Pedido (1:N)
Representante_1.default.hasMany(Pedido_1.default, { foreignKey: 'representanteId', as: 'pedidos' });
Pedido_1.default.belongsTo(Representante_1.default, { foreignKey: 'representanteId', as: 'representante' });
// Produto -> Pedido (N:N através de itens JSON)
// Produto -> MovimentacaoEstoque (1:N)
Produto_1.default.hasMany(MovimentacaoEstoque_1.default, { foreignKey: 'produtoId', as: 'movimentacoes' });
MovimentacaoEstoque_1.default.belongsTo(Produto_1.default, { foreignKey: 'produtoId', as: 'produto' });
// Cliente -> Orcamento (1:N)
Cliente_1.default.hasMany(Orcamento_1.default, { foreignKey: 'clienteId', as: 'orcamentos' });
Orcamento_1.default.belongsTo(Cliente_1.default, { foreignKey: 'clienteId', as: 'cliente' });
// Representante -> Orcamento (1:N)
Representante_1.default.hasMany(Orcamento_1.default, { foreignKey: 'representanteId', as: 'orcamentos' });
Orcamento_1.default.belongsTo(Representante_1.default, { foreignKey: 'representanteId', as: 'representante' });
// Produto -> Orcamento (1:N)
Produto_1.default.hasMany(Orcamento_1.default, { foreignKey: 'produtoId', as: 'orcamentos' });
Orcamento_1.default.belongsTo(Produto_1.default, { foreignKey: 'produtoId', as: 'produto' });

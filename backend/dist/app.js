"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const orders_1 = __importDefault(require("./routes/orders"));
// Carrega as variáveis de ambiente
dotenv_1.default.config();
// Conecta ao MongoDB
(0, database_1.default)();
const app = (0, express_1.default)();
// Configuração do CORS
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Diretório de uploads estático
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rotas
app.use('/api/auth', auth_1.default);
app.use('/api/orders', orders_1.default);
// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});
// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

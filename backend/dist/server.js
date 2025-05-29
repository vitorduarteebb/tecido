"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const auth_1 = __importDefault(require("./routes/auth"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigins,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Servir arquivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// Rotas
app.use('/api/auth', auth_1.default);
app.use('/api', userRoutes_1.default);
app.use('/api', productRoutes_1.default);
app.use('/api', orderRoutes_1.default);
// Rota de healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        message: 'Erro interno do servidor',
        error: config_1.config.env === 'development' ? err.message : undefined
    });
});
// Conexão com o MongoDB
mongoose_1.default.connect(config_1.config.mongoUri)
    .then(() => {
    console.log('Conectado ao MongoDB');
    // Inicia o servidor
    app.listen(config_1.config.port, () => {
        console.log(`Servidor rodando na porta ${config_1.config.port}`);
    });
})
    .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
});

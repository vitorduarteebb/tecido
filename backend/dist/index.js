"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const representanteRoutes_1 = __importDefault(require("./routes/representanteRoutes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Conexão com o MongoDB
mongoose_1.default.connect(config_1.config.mongoUri)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));
// Rotas
app.use('/api/representantes', representanteRoutes_1.default);
// Inicialização do servidor
app.listen(config_1.config.port, () => {
    console.log(`Servidor rodando na porta ${config_1.config.port}`);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'], // Aceita todas as portas do Vite
    credentials: true, // Required for cookies, authorization headers with HTTPS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/api', routes_1.default); // Add /api prefix to match frontend expectations
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '../uploads')));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});
// Connect to database and start server
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();

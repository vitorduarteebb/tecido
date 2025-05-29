"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tecidos-app',
    jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta_aqui',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB em bytes
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    corsOrigins: ((_a = process.env.CORS_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:5173'],
    env: process.env.NODE_ENV || 'development',
    bcryptSaltRounds: 10
};

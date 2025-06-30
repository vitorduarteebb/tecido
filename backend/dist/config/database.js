"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbPath = path_1.default.join(__dirname, '../../database.sqlite');
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        await exports.sequelize.sync({ alter: true });
        console.log('SQLite conectado com sucesso');
    }
    catch (error) {
        console.error('Erro ao conectar SQLite:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = exports.sequelize;

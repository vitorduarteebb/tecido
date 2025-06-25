"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.config = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tecidos',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    port: process.env.PORT || 3001
};
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(exports.config.mongoUri);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
exports.default = exports.config;

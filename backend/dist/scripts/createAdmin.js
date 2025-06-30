"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const Admin_1 = __importDefault(require("../models/Admin"));
const types_1 = require("../types");
const createAdmin = async () => {
    try {
        await (0, database_1.connectDB)();
        // Remove existing admin if exists
        await Admin_1.default.destroy({ where: { email: 'admin@tecidos.com' } });
        // Create admin user
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash('admin123', salt);
        const admin = new Admin_1.default({
            nome: 'Administrador',
            email: 'admin@tecidos.com',
            senha: hashedPassword,
            role: types_1.UserRole.ADMINISTRADOR
        });
        await admin.save();
        console.log('Admin user created successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};
createAdmin();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("./config");
// Configuração do armazenamento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config_1.config.uploadDir);
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o arquivo
        crypto_1.default.randomBytes(16, (err, hash) => {
            if (err)
                cb(err, '');
            const fileName = `${hash.toString('hex')}-${file.originalname}`;
            cb(null, fileName);
        });
    }
});
// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    if (config_1.config.allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não suportado'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: config_1.config.maxFileSize
    }
});

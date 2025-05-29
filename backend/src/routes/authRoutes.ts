import express from 'express';
import { authController } from '../controllers/authController';

const router = express.Router();

// Rota de login
router.post('/login', authController.login);

export default router; 
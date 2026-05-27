// Camada de rotas da autenticação.
// Responsável por expor o endpoint de login e ligar a rota ao controller

// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';

const router = Router();
const authController = new AuthController();

// Login unificado que retorna o token com a 'role'
router.post('/login', authController.login);

export default router;
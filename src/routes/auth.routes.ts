// Camada de rotas da autenticação.
// Responsável por expor o endpoint de login e ligar a rota ao controller

import { Router } from 'express';
import { AuthController } from '../controller/login.controller';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login.bind(controller));

export default router;





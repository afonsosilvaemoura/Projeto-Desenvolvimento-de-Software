import { Router } from 'express';
import { LoginController } from '../controller/login.controller';

const router = Router();
const controller = new LoginController();
console.log('Configuração de rota de autenticação carregada.');
router.post('/login', controller.login.bind(controller));

export default router;
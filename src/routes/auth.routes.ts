import { Router } from 'express';
import { LoginController } from '../controller/login.controller';

const router = Router();
const controller = new LoginController();

router.post('/login', controller.login.bind(controller));

export default router;
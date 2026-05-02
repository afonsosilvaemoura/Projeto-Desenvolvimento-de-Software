import { Router } from 'express';
import { AuthController } from '../controller/auth';
import { autenticar } from '../middleware/auth';

const router = Router();
const ctrl = new AuthController();

// POST /auth/login
router.post('/login', (req, res) => ctrl.login(req, res));

// POST /auth/logout  (requer autenticação)
router.post('/logout', autenticar, (req, res) => ctrl.logout(req, res));

// GET /auth/me
router.get('/me', autenticar, (req, res) => ctrl.me(req, res));

export default router;


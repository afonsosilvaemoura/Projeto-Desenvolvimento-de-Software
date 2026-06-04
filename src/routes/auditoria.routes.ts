import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { AuditoriaController } from '../controller/auditoria.controller';

const router = Router();
const controller = new AuditoriaController();

router.get('/',        authMiddleware, authorize(['administrador']), controller.listar.bind(controller));
router.get('/exportar', authMiddleware, authorize(['administrador']), controller.exportar.bind(controller));

export default router;

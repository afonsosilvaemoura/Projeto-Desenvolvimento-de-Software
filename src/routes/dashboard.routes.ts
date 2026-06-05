import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { DashboardController } from '../controller/dashboard.controller';

const router = Router();
const controller = new DashboardController();

router.get('/utente/:userId',         authMiddleware, controller.getDashboardUtente.bind(controller));
router.get('/medico/alertas-utentes', authMiddleware, authorize(['medico']), controller.getAlertasMedico.bind(controller));
router.get('/medico/:medicoId',        authMiddleware, authorize(['medico']), controller.getDashboardMedico.bind(controller));
router.get('/admin/stats',            authMiddleware, authorize(['administrador']), controller.getEstatisticasAdmin.bind(controller));

export default router;

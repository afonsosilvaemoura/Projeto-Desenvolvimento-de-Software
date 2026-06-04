import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { AlertaController } from '../controller/alerta.controller';

const router = Router();
const controller = new AlertaController();

// Rotas do médico
router.get('/medico', authMiddleware, authorize(['medico']), controller.getAlertasMedico.bind(controller));
router.patch('/:id/estado', authMiddleware, authorize(['medico']), controller.updateEstado.bind(controller));

// Rotas do administrador
router.get('/', authMiddleware, authorize(['administrador']), controller.getAllAlertas.bind(controller));
router.put('/limiar', authMiddleware, authorize(['administrador']), controller.updateLimiar.bind(controller));

// Limiar acessível a todos os autenticados (usado no gráfico CARAT do utente)
router.get('/limiar', authMiddleware, controller.getLimiar.bind(controller));

export default router;

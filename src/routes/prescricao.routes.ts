import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { PrescricaoController } from '../controller/prescricao.controller';

const router = Router();
const controller = new PrescricaoController();

router.get('/',           authMiddleware, authorize(['medico', 'utente']), controller.listarComDTO.bind(controller));
router.post('/',          authMiddleware, authorize(['medico']),            controller.criarComDTO.bind(controller));
router.patch('/:id/ativo',authMiddleware, authorize(['medico']),            controller.toggleAtivo.bind(controller));

export default router;

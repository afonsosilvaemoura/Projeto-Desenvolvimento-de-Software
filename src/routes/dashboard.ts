import { Router } from 'express';
import { DashboardController } from '../controller/dashboard';
import { autenticar, verificarAcessoUtente } from '../middleware/auth';

const router = Router();
const ctrl = new DashboardController();

router.get('/:utenteId', autenticar, verificarAcessoUtente, (req, res) => ctrl.obter(req, res));

export default router;


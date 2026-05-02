import { Router } from 'express';
import { AlertaController } from '../controller/alerta';
import { autenticar, autorizar } from '../middleware/auth';
import { PerfilUtilizador } from '../models/entities';

const router = Router();
const ctrl = new AlertaController();
const { ADMINISTRADOR, MEDICO, UTENTE } = PerfilUtilizador;

router.get('/limiares', autenticar, (req, res) => ctrl.obterLimiares(req, res));
router.put('/limiares', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.atualizarLimiares(req, res));
router.get('/', autenticar, autorizar(ADMINISTRADOR, MEDICO, UTENTE), (req, res) => ctrl.listar(req, res));
router.get('/:id', autenticar, (req, res) => ctrl.obter(req, res));
router.patch('/:id/estado', autenticar, autorizar(MEDICO, ADMINISTRADOR), (req, res) => ctrl.atualizarEstado(req, res));

export default router;

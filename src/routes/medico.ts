import { Router } from 'express';
import { MedicoController } from '../controller/medico';
import { autenticar, autorizar } from '../middleware/auth';
import { PerfilUtilizador } from '../models/entities';

const router = Router();
const ctrl = new MedicoController();
const { ADMINISTRADOR } = PerfilUtilizador;

router.get('/', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.listar(req, res));
router.post('/', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.criar(req, res));
router.get('/:id', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.obter(req, res));
router.put('/:id', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.atualizar(req, res));
router.patch('/:id/inativar', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.inativar(req, res));
router.patch('/:id/utentes/:utenteId/reassociar', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.reassociarUtente(req, res));

export default router;

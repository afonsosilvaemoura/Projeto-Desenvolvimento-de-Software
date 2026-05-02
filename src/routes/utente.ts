import { Router } from 'express';
import { UtenteController } from '../controller/utente';
import { autenticar, autorizar, verificarAcessoUtente } from '../middleware/auth';
import { PerfilUtilizador } from '../models/entities';

const router = Router();
const ctrl = new UtenteController();

const { ADMINISTRADOR, MEDICO, UTENTE } = PerfilUtilizador;

// GET /utentes
router.get('/', autenticar, autorizar(ADMINISTRADOR, MEDICO), (req, res) => ctrl.listar(req, res));

// POST /utentes
router.post('/', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.criar(req, res));

// GET /utentes/:id
router.get('/:id', autenticar, verificarAcessoUtente, (req, res) => ctrl.obter(req, res));

// PUT /utentes/:id
router.put('/:id', autenticar, verificarAcessoUtente, (req, res) => ctrl.atualizar(req, res));

// DELETE /utentes/:id  (apenas Admin)
router.delete('/:id', autenticar, autorizar(ADMINISTRADOR), (req, res) => ctrl.remover(req, res));

// GET /utentes/:id/historico-clinico  (Médico ou Utente próprio)
router.get('/:id/historico-clinico', autenticar,
  autorizar(MEDICO, UTENTE), verificarAcessoUtente,
  (req, res) => ctrl.historicoClinico(req, res));

export default router;


import { Router } from 'express';
import { MedicacaoController, ExameController } from '../controller/medicao';
import { autenticar, autorizar, verificarAcessoUtente } from '../middleware/auth';
import { PerfilUtilizador } from '../models/entities';

const router = Router({ mergeParams: true });
const medCtrl = new MedicacaoController();
const examCtrl = new ExameController();

const { MEDICO } = PerfilUtilizador;

// ── Medicação ──────────────────────────────────────────
// GET  /utentes/:utenteId/medicacao
router.get('/medicacao', autenticar, verificarAcessoUtente, (req, res) => medCtrl.listar(req, res));

// POST /utentes/:utenteId/medicacao
router.post('/medicacao', autenticar, autorizar(MEDICO), verificarAcessoUtente, (req, res) => medCtrl.registar(req, res));

// PUT  /utentes/:utenteId/medicacao/:id
router.put('/medicacao/:id', autenticar, autorizar(MEDICO), verificarAcessoUtente, (req, res) => medCtrl.atualizar(req, res));

// PATCH /utentes/:utenteId/medicacao/:id/suspender
router.patch('/medicacao/:id/suspender', autenticar, autorizar(MEDICO), verificarAcessoUtente, (req, res) => medCtrl.suspender(req, res));

// ── Exames ─────────────────────────────────────────────
// GET  /utentes/:utenteId/exames
router.get('/exames', autenticar, verificarAcessoUtente, (req, res) => examCtrl.listar(req, res));

// POST /utentes/:utenteId/exames
router.post('/exames', autenticar, autorizar(MEDICO), verificarAcessoUtente, (req, res) => examCtrl.registar(req, res));

// PATCH /utentes/:utenteId/exames/:id/resultado
router.patch('/exames/:id/resultado', autenticar, autorizar(MEDICO), verificarAcessoUtente, (req, res) => examCtrl.registarResultado(req, res));

export default router;

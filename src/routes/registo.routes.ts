import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { RegistoController } from '../controller/registo.controller';

const router = Router();
const controller = new RegistoController();

// ── Consultas ─────────────────────────────────────────────────────────────────
router.get('/utentes',     authMiddleware, controller.listarUtentes.bind(controller));
router.get('/utente/:id',  authMiddleware, controller.getUtente.bind(controller));
router.get('/medicos',     authMiddleware, controller.listarMedicos.bind(controller));

// ── Criação ───────────────────────────────────────────────────────────────────
router.post('/utente',     authMiddleware, controller.criarUtente.bind(controller));
router.post('/medico',     authMiddleware, controller.criarMedico.bind(controller));

// ── Perfil do utente ──────────────────────────────────────────────────────────
router.get('/perfil',      authMiddleware, controller.getPerfil.bind(controller));
router.put('/perfil',      authMiddleware, controller.atualizarPerfil.bind(controller));

export default router;

import { Router } from 'express';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import { AdminController } from '../controller/admin.controller';
import { AlertaController } from '../controller/alerta.controller';
import { DashboardController } from '../controller/dashboard.controller';

const router = Router();
const admin     = new AdminController();
const alerta    = new AlertaController();
const dashboard = new DashboardController();

const adminOnly = [authMiddleware, authorize(['administrador'])] as const;

// ── Médicos ──────────────────────────────────────────────────────────────────
router.get('/medicos',              ...adminOnly, admin.listarMedicos.bind(admin));
router.patch('/medico/:id/ativo',   ...adminOnly, admin.toggleMedico.bind(admin));
router.post('/medico/:id/desativar',...adminOnly, admin.desativarMedico.bind(admin));
router.get('/medico/:id/utentes',   ...adminOnly, admin.getUtentesDeMedico.bind(admin));
router.patch('/medico/:id/realocar',...adminOnly, admin.realocarUtentes.bind(admin));

// ── Utentes ──────────────────────────────────────────────────────────────────
router.get('/utentes',              ...adminOnly, admin.listarUtentes.bind(admin));
router.patch('/utente/:id/ativo',   ...adminOnly, admin.toggleUtente.bind(admin));

// ── Alertas e Limiares (delegados para AlertaController) ─────────────────────
router.get('/alertas',              ...adminOnly, alerta.getAllAlertas.bind(alerta));
router.get('/limiar',               ...adminOnly, alerta.getLimiar.bind(alerta));
router.put('/limiar',               ...adminOnly, alerta.updateLimiar.bind(alerta));

// ── Dashboard clínico por utente ─────────────────────────────────────────────
router.get('/dashboard/:utenteId',  authMiddleware, dashboard.getDashboardAdmin.bind(dashboard));

export default router;

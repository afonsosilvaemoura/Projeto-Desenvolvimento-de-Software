import { Router, Request, Response, NextFunction } from 'express';
import { CaratController } from '../controller/carat';
import { autenticar, autorizar, verificarAcessoUtente } from '../middleware/auth';
import { PerfilUtilizador } from '../models/entities';

const router = Router();
const ctrl = new CaratController();
const { MEDICO, UTENTE } = PerfilUtilizador;

// GET /carat/perguntas  — público
router.get('/perguntas', (req, res) => ctrl.perguntas(req, res));

// POST /carat/avaliacoes  — autenticado OU anónimo
router.post('/avaliacoes', (req: Request, res: Response, next: NextFunction) => {
  // Tenta autenticar mas não bloqueia se não houver token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    autenticar(req, res, next);
  } else {
    next(); // utilizador anónimo
  }
}, (req, res) => ctrl.submeter(req, res));

// GET /carat/avaliacoes/utente/:utenteId
router.get('/avaliacoes/utente/:utenteId', autenticar, autorizar(MEDICO, UTENTE),
  verificarAcessoUtente, (req, res) => ctrl.historico(req, res));

// GET /carat/avaliacoes/:id
router.get('/avaliacoes/:id', autenticar, (req, res) => ctrl.obter(req, res));

export default router;

import { Router } from 'express';
import { buscarCARAT, criarAvaliacaoCarat } from '../controller/carat.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Esta rota passa primeiro pelo authMiddleware, se falhar nem chega ao buscarCARAT
router.get('/carat', authMiddleware, buscarCARAT);
router.post('/carat', authMiddleware, criarAvaliacaoCarat);


/* GET /carat — listar todas as avaliações
router.get('/', (req, res) => ctrl.listar(req, res));
router.post('/', (req, res) => ctrl.criar(req, res));


/* GET /carat/perguntas  — público
router.get('/perguntas', (req, res) => ctrl.perguntas(req, res));

// POST /carat/avaliacoes  — autenticado OU anónimo
router.post('/avaliacoes', (req: Request, res: Response, next: NextFunction) => ctrl.criar(req, res).catch(next));

/* GET /carat/avaliacoes/utente/:utenteId
router.get('/avaliacoes/utente/:utenteId', autenticar, autorizar(MEDICO, UTENTE),
  verificarAcessoUtente, (req, res) => ctrl.historico(req, res));

// GET /carat/avaliacoes/:id
router.get('/avaliacoes/:id', autenticar, (req, res) => ctrl.obter(req, res));
*/
export default router;

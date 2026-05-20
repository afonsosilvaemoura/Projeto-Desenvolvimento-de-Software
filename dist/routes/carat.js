"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carat_controller_1 = require("../controller/carat.controller");
const router = (0, express_1.Router)();
const ctrl = new carat_controller_1.CaratController();
// GET /carat — listar todas as avaliações
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
exports.default = router;

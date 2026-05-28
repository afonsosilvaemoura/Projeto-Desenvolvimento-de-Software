import { Router } from 'express';
import { criarAvaliacaoCarat, listarAvaliacoesCarat } from '../controller/carat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { PERGUNTAS_CARAT, OPCOES_RESPOSTA } from '../services/carat.service';

const routes = Router();

// GET /carat/perguntas — público
routes.get('/perguntas', (_req, res) => {
  res.json({ perguntas: PERGUNTAS_CARAT, opcoes: OPCOES_RESPOSTA });
});

// GET /carat — lista avaliações (autenticado)
routes.get('/', authMiddleware, listarAvaliacoesCarat);

// POST /carat — criar avaliação (autenticado)
routes.post('/', authMiddleware, criarAvaliacaoCarat);

export default routes;
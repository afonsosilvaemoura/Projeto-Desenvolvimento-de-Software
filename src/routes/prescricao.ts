/*import { Router } from 'express';
import { PrescricaoController } from '../controller/prescricao.controller';

// IMPORTANTE: Ajuste o caminho de importação caso tenha colocado o `authorize` num ficheiro separado (como role.middleware.ts)
import { authMiddleware, authorize } from '../middleware/auth.middleware'; 

const routes = Router();
const controller = new PrescricaoController();

// GET: Listar prescrições
// Permite acesso tanto a médicos como a utentes
routes.get(
    '/', 
    authMiddleware, 
    authorize(['medico', 'utente']), 
    controller.listarComDTO.bind(controller)
);

// POST: Criar prescrição
// APENAS médicos podem criar novas prescrições
routes.post(
    '/', 
    authMiddleware, 
    authorize(['medico']), 
    controller.criarComDTO.bind(controller)
);

export default routes;*/

import { Router, Response } from 'express';
import { PrescricaoController } from '../controller/prescricao.controller';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../database/database';

const routes = Router();
const controller = new PrescricaoController();

routes.get('/', authMiddleware, authorize(['medico', 'utente']), controller.listarComDTO.bind(controller));
routes.post('/', authMiddleware, authorize(['medico']), controller.criarComDTO.bind(controller));

routes.patch('/:id/ativo', authMiddleware, authorize(['medico']), (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { ativo } = req.body;
    if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
    const presc = db.prepare(`
      SELECT p.id FROM prescricao p JOIN utente u ON p.utente_id = u.id
      WHERE p.id = ? AND u.medico_id = ?
    `).get(id, req.user!.id);
    if (!presc) return res.status(404).json({ erro: 'Prescrição não encontrada ou sem permissão.' });
    db.prepare('UPDATE prescricao SET ativo = ? WHERE id = ?').run(ativo ? 1 : 0, id);
    return res.json({ mensagem: `Prescrição ${ativo ? 'ativada' : 'inativada'}.` });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default routes;
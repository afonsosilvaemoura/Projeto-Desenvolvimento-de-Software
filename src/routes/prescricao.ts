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

import { Router } from 'express';
import { PrescricaoController } from '../controller/prescricao.controller';

const routes = Router();
const controller = new PrescricaoController();

routes.get('/', controller.listarComDTO.bind(controller));
routes.post('/', controller.criarComDTO.bind(controller));


export default routes;
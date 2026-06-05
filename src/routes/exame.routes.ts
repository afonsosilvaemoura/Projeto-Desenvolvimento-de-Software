import { Router } from 'express';
import { ExameController } from '../controller/exame.controller';
import { authMiddleware, authorize } from '../middleware/auth.middleware';

const routes = Router();
const controller = new ExameController();

routes.get('/', authMiddleware, authorize(['medico', 'utente']), controller.listar.bind(controller));
routes.post('/', authMiddleware, authorize(['medico']), controller.criar.bind(controller)); 

export default routes;
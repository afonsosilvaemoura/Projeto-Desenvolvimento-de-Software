import { Router } from 'express';
import { ExameController } from '../controller/exame.controller';
import { authMiddleware, authorize } from '../middleware/auth.middleware';
import router from './fhir';

const routes = Router();
const controller = new ExameController();
router.get('/:id', authMiddleware, authorize(['utente', 'medico']), controller.listarExamecomDTO);

routes.get('/', controller.listar.bind(controller));
routes.post('/', controller.criar.bind(controller));

export default routes;

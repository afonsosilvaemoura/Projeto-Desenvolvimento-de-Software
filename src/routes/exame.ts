import { Router } from 'express';
import { ExameController } from '../controller/exame.controller';

const routes = Router();
const controller = new ExameController();

routes.get('/', controller.listarComDTO.bind(controller));
routes.post('/', controller.criarComDTO.bind(controller));

export default routes;
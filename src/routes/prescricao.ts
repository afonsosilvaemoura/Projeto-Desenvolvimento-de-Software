import { Router } from 'express';
import { PrescricaoController } from '../controller/prescricao.controller';

const routes = Router();
const controller = new PrescricaoController();

routes.get('/', controller.listarComDTO.bind(controller));
routes.post('/', controller.criar.bind(controller));

export default routes;
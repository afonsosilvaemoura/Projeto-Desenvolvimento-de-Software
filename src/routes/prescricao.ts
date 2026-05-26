import { Router } from 'express';
import { PrescricaoController } from '../controller/prescricao.controller';

const routes = Router();
const controller = new PrescricaoController();

routes.get('/', controller.listarComDTO.bind);
routes.post('/', controller.criar);

export default routes;
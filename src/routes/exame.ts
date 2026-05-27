import { Router } from 'express';
import { ExameController } from '../controller/exame.controller';

const routes = Router();
const controller = new ExameController();

routes.get('/', controller.listarComDTO);
routes.post('/', controller.criar);

export default routes;
import { authorize } from '../middleware/auth.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import router from './fhir';


router.post('/prescricao', authMiddleware, authorize(['utente']), controller.listarPrescricao);
    
import { authorize } from '../middleware/auth.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import router from './fhir';

// Exemplo: Apenas médicos podem aceder a esta rota
router.post('/prescricao', authMiddleware, authorize(['medico']), controller.criarPrescricao);
    
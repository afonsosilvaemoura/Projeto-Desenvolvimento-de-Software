import { Router } from 'express';
import { getObservationsFromFhir, getPrescricoesAsFhir, getExamesAsFhir } from '../services/fhir.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/observations', async (req, res) => {
  try {
    const code = typeof req.query.code === 'string'
      ? req.query.code
      : '8310-5';

    const patient = typeof req.query.patient === 'string'
      ? req.query.patient
      : undefined;

    const observations = await getObservationsFromFhir(code, patient);

    res.json(observations);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao consultar servidor FHIR.'
    });
  }
});

router.get('/medication-requests', authMiddleware, (req, res) => {
  try {
    const patient = typeof req.query.patient === 'string' ? Number(req.query.patient) : undefined;
    res.json(getPrescricoesAsFhir(patient));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao gerar FHIR MedicationRequest.' });
  }
});

router.get('/service-requests', authMiddleware, (req, res) => {
  try {
    const patient = typeof req.query.patient === 'string' ? Number(req.query.patient) : undefined;
    res.json(getExamesAsFhir(patient));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao gerar FHIR ServiceRequest.' });
  }
});

export default router;
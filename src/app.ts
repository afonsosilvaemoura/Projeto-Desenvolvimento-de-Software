import express from 'express';
import path from 'path';
import { PERGUNTAS_CARAT, OPCOES_RESPOSTA } from './services/carat.service';

console.log('✓ Imports carregados');
console.log('Iniciando aplicação...');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Middleware global ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.listen(PORT, () => console.log(`Servidor a correr em http://localhost:${PORT}`));

// CORS básico para desenvolvimento
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// ── Ficheiros estáticos ───────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));


// Mock data para as rotas
const mockPrescricoes: any[] = [];
const mockExames: any[] = [];
const mockCarat: any[] = [];

// GET /prescricoes
app.get('/prescricoes', (_req, res) => {
  res.json(mockPrescricoes);
});

// POST /prescricoes
app.post('/prescricoes', (req, res) => {
  const { medicamento, dose, medico_nome } = req.body;
  const novaPrescricao = {
    id: mockPrescricoes.length + 1,
    medicamento,
    dose,
    medico_nome,
    dataCriacao: new Date().toISOString()
  };
  mockPrescricoes.push(novaPrescricao);
  res.status(201).json({ mensagem: `Prescrição para ${medicamento} criada`, prescricao: novaPrescricao });
});

// GET /exames
app.get('/exames', (_req, res) => {
  res.json(mockExames);
});

// GET /carat
app.get('/carat', (_req, res) => {
  res.json(mockCarat);
});

// GET /carat/perguntas
app.get('/carat/perguntas', (_req, res) => {
  res.json({
    perguntas: PERGUNTAS_CARAT,
    opcoes: OPCOES_RESPOSTA,
    totalPerguntas: PERGUNTAS_CARAT.length
  });
});

// POST /carat - Submeter respostas
app.post('/carat', (req, res) => {
  try {
    const { perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10 } = req.body;
    
    const novaAvaliacao = {
      id: mockCarat.length + 1,
      perg1, perg2, perg3, perg4, perg5, perg6, perg7, perg8, perg9, perg10,
      scoreTotal: perg1 + perg2 + perg3 + perg4 + perg5 + perg6 + perg7 + perg8 + perg9 + perg10,
      scoreRinite: perg1 + perg2 + perg3 + perg4,
      scoreAsma: perg5 + perg6 + perg7 + perg8 + perg9 + perg10,
      dataCriacao: new Date().toISOString()
    };
    
    mockCarat.push(novaAvaliacao);
    res.status(201).json({ mensagem: 'Avaliação CARAT registada com sucesso', avaliacao: novaAvaliacao });
  } catch (error: any) {
    res.status(400).json({ erro: error.message });
  }
});

// GET /fhir/observations
app.get('/fhir/observations', (req, res) => {
  const code = req.query.code as string || '8310-5';
  const mockObservations = [
    {
      id: '1',
      code: code,
      display: 'Temperatura corporal',
      value: 36.5,
      unit: 'Celsius',
      effectiveDateTime: new Date().toISOString(),
      subject: 'Paciente 001',
      status: 'final'
    }
  ];
  res.json(mockObservations);
});

// ── Rota raiz ──────────────────────────────────────────
app.get('/', (_req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── API Info ────────────────────────────────────────────
app.get('/api/info', (_req: express.Request, res: express.Response) => {
  res.json({
    sistema: 'SAUDINOB',
    descricao: 'Sistema de prevenção e acompanhamento de doenças respiratórias crónicas',
    versao: '1.0.0',
    endpoints: {
      prescricoes: '/prescricoes',
      exames: '/exames',
      carat: '/carat',
      fhir: '/fhir/observations'
    },
  });
});

// ── Tratamento de erros ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERRO]', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: err.message });
});

// ── Arranque ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nSAUDINOB API a correr em http://localhost:${PORT}`);
});
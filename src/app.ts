import express from 'express';
import authRoutes from './routes/auth';
import utenteRoutes from './routes/utente';
import medicoRoutes from './routes/medico';
import caratRoutes from './routes/carat';
import alertaRoutes from './routes/alerta';
import dashboardRoutes from './routes/dashboard';

console.log('✓ Imports carregados');
console.log('Iniciando aplicação...');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS básico para desenvolvimento
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// ── Rotas ──────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/utentes', utenteRoutes);
app.use('/medicos', medicoRoutes);
app.use('/carat', caratRoutes);
app.use('/alertas', alertaRoutes);
app.use('/dashboard', dashboardRoutes);

// ── Rota raiz ──────────────────────────────────────────
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    sistema: 'SAUDINOB',
    descricao: 'Sistema de prevenção e acompanhamento de doenças respiratórias crónicas',
    versao: '1.0.0',
    endpoints: {
      auth: '/auth/login | /auth/logout | /auth/me',
      utentes: '/utentes',
      medicos: '/medicos',
      carat: '/carat/perguntas | /carat/avaliacoes',
      alertas: '/alertas',
      dashboard: '/dashboard/:utenteId',
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
app.listen(3000, () => {
  console.log(`\n🏥 SAUDINOB API a correr em http://localhost:3000`);
  console.log(`   Executar seed: npm run seed\n`);
});

export default app;
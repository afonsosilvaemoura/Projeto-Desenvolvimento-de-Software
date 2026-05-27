/*import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes';
import prescricaoRoutes from './routes/prescricao';
import exameRoutes from './routes/exame';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Middleware Global ──────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS básico
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// ── Ficheiros estáticos ───────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Rotas (Mapeamento) ────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/prescricoes', prescricaoRoutes);
app.use('/exames', exameRoutes);

// ── Rota raiz ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Tratamento de erros ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ── Arranque do Servidor ──────────────────────────────
app.listen(PORT, () => {
  console.log(`\nSAUDINOB API a correr em http://localhost:${PORT}`);
});*/

import express from 'express';
import path from 'path';
import { AppDataSource } from './database/database';
import { Prescricao } from './models/prescricao.entity';
import { Exame } from './models/exame.entity';
import exameRoutes from './routes/exame';
import prescricaoRoutes from './routes/prescricao';

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
app.use('/prescricoes', prescricaoRoutes);
app.use('/exames', exameRoutes);
app.use('/pedidos-exames', exameRoutes);

if (require.main === module) {
    AppDataSource.initialize().then(async () => {

        const prescricaoRepo = AppDataSource.getRepository(Prescricao);
        if (await prescricaoRepo.count() === 0) {
            await prescricaoRepo.save({ medicamento: 'Aspirina', dose: '500mg', medico_nome: 'Dr. House', dataCriacao: new Date() });
        }

        const exameRepo = AppDataSource.getRepository(Exame);
        if (await exameRepo.count() === 0) {
            await exameRepo.save({ nome: 'RX Torax', codigo: 'RX01', medico_nome: 'Dr. House', dataCriacao: new Date() });
        }

        app.listen(3000, () => console.log("Servidor (TypeORM + SQLite) a correr na porta 3000"));
    });
}

export default app;
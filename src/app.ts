import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { initializeDatabase } from './database/database';

import authRoutes    from './routes/auth.routes';
import prescRoutes   from './routes/prescricao';
import exameRoutes   from './routes/exame';
import caratRoutes   from './routes/carat';
import fhirRoutes    from './routes/fhir';
import registoRoutes from './routes/registo.routes';
import adminRoutes   from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.api';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth',  authRoutes);
app.use('/prescricoes', prescRoutes);
app.use('/exames',    exameRoutes);
app.use('/carat',     caratRoutes);
app.use('/fhir',      fhirRoutes);
app.use('/registo',   registoRoutes);
app.use('/admin',     adminRoutes);
app.use('/dashboard', dashboardRoutes);

initializeDatabase().then(() => {
  app.listen(3000, () => {
    console.log('\nSAUDINOB a correr em http://localhost:3000');
    console.log('   Para popular a BD: npx ts-node src/database/seed.ts');
  });
});
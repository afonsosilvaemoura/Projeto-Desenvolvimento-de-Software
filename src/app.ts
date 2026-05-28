import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { initializeDatabase } from './database/database';

import authRoutes       from './routes/auth.routes';
import prescricaoRoutes from './routes/prescricao';
import exameRoutes      from './routes/exame';
import caratRoutes      from './routes/carat';
import fhirRoutes       from './routes/fhir';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.use('/api/auth',    authRoutes);
app.use('/prescricoes', prescricaoRoutes);
app.use('/exames',      exameRoutes);
app.use('/carat',       caratRoutes);
app.use('/fhir',        fhirRoutes);

initializeDatabase().then(() => {
  app.listen(3000, () => {
    console.log('SAUDINOB API a correr em http://localhost:3000');
  });
});
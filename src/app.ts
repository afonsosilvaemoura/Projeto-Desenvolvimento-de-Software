import express from 'express';
import path from 'path';
import './database/database';

import authRoutes      from './routes/auth.routes';
import prescRoutes     from './routes/prescricao.routes';
import exameRoutes     from './routes/exame.routes';
import caratRoutes     from './routes/carat.routes';
import fhirRoutes      from './routes/fhir.routes';
import registoRoutes   from './routes/registo.routes';
import adminRoutes     from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import alertaRoutes    from './routes/alerta.routes';
import auditoriaRoutes from './routes/auditoria.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/auth',      authRoutes);
app.use('/prescricoes', prescRoutes);
app.use('/exames',    exameRoutes);
app.use('/carat',     caratRoutes);
app.use('/fhir',      fhirRoutes);
app.use('/registo',   registoRoutes);
app.use('/admin',     adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/alertas',   alertaRoutes);
app.use('/auditoria', auditoriaRoutes);

app.listen(3000, () => {
  console.log('\nSAUDINOB a correr em http://localhost:3000');
  console.log('   Para popular a BD: npx ts-node src/database/seed.ts');
});

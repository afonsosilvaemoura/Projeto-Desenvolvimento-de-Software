import express from 'express';
import path from 'path';
import { PERGUNTAS_CARAT, OPCOES_RESPOSTA } from './services/carat.service';
// Importe as suas rotas aqui
import prescricaoRoutes from './routes/prescricao';
import ExameRoutes from './routes/exame';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ficheiros estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas importadas (Adicione isto ao seu Bloco 1)
app.use('/prescricoes', prescricaoRoutes);
app.use('/exames', ExameRoutes);


// Suas outras rotas (GET /carat, etc...)
// ...

// Iniciar servidor apenas UMA vez
app.listen(3000, () => {
  console.log(`SAUDINOB API a correr em http://localhost:3000`);
});
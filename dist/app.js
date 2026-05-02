"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const utente_1 = __importDefault(require("./routes/utente"));
const medico_1 = __importDefault(require("./routes/medico"));
const carat_1 = __importDefault(require("./routes/carat"));
const alerta_1 = __importDefault(require("./routes/alerta"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
console.log('✓ Imports carregados');
console.log('Iniciando aplicação...');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ── Middleware global ──────────────────────────────────
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS básico para desenvolvimento
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    next();
});
// ── Rotas ──────────────────────────────────────────────
app.use('/auth', auth_1.default);
app.use('/utentes', utente_1.default);
app.use('/medicos', medico_1.default);
app.use('/carat', carat_1.default);
app.use('/alertas', alerta_1.default);
app.use('/dashboard', dashboard_1.default);
// ── Rota raiz ──────────────────────────────────────────
app.get('/', (_req, res) => {
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
app.use((err, _req, res, _next) => {
    console.error('[ERRO]', err.message);
    res.status(500).json({ erro: 'Erro interno do servidor.', detalhe: err.message });
});
// ── Arranque ───────────────────────────────────────────
app.listen(3000, () => {
    console.log(`\n🏥 SAUDINOB API a correr em http://localhost:3000`);
    console.log(`   Executar seed: npm run seed\n`);
});
exports.default = app;

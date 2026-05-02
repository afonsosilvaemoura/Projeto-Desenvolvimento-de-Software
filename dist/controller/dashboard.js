"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const db_1 = require("../database/db");
const auditoria_1 = require("../services/auditoria");
class DashboardController {
    // GET /dashboard/:utenteId
    obter(req, res) {
        const db = (0, db_1.getDb)();
        const user = req.utilizador;
        const utenteId = req.params.utenteId;
        // Dados do utente
        const utente = db.prepare(`
      SELECT u.id, u.nome, u.email, ut.data_nascimento, ut.medico_id, m.nome AS medico_nome, m.id AS medico_id_real
      FROM utilizadores u
      JOIN utentes ut ON u.id = ut.id
      JOIN utilizadores m ON m.id = ut.medico_id
      WHERE u.id = ?
    `).get(utenteId);
        if (!utente) {
            res.status(404).json({ erro: 'Utente não encontrado.' });
            return;
        }
        // Histórico de avaliações CARAT (para o gráfico)
        const avaliacoes = db.prepare(`
      SELECT id, data, score, nivel_controlo, proximo_passo_semanas
      FROM avaliacoes_carat
      WHERE utente_id = ?
      ORDER BY data ASC
    `).all(utenteId);
        // Limiar de controlo (para a linha horizontal no gráfico)
        const limiar = db.prepare('SELECT score_minimo FROM limiares_alerta LIMIT 1').get();
        // Alertas ativos
        const alertas = db.prepare(`
      SELECT * FROM alertas
      WHERE utente_id = ? AND estado IN ('NOVO','VISTO','EM_SEGUIMENTO')
      ORDER BY criado_em DESC
    `).all(utenteId);
        // Última avaliação
        const ultimaAvaliacao = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : null;
        // Medicação ativa
        const medicacaoAtiva = db.prepare("SELECT * FROM medicacao WHERE utente_id=? AND estado='ATIVA' ORDER BY data_inicio DESC").all(utenteId);
        (0, auditoria_1.registarAuditoria)(user.id, 'VER_DASHBOARD', 'utentes', utenteId);
        res.json({
            utente: {
                id: utente.id,
                nome: utente.nome,
                email: utente.email,
                data_nascimento: utente.data_nascimento,
                medico: { id: utente.medico_id_real, nome: utente.medico_nome },
            },
            grafico_carat: {
                avaliacoes,
                limiar_controlo_insuficiente: limiar?.score_minimo ?? 16,
            },
            ultima_avaliacao: ultimaAvaliacao,
            alertas_ativos: alertas,
            medicacao_ativa: medicacaoAtiva,
            sem_dados: avaliacoes.length === 0,
        });
    }
}
exports.DashboardController = DashboardController;

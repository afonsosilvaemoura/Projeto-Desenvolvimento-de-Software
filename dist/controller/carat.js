"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaratController = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const carat_1 = require("../services/carat");
const auditoria_1 = require("../services/auditoria");
const entities_1 = require("../models/entities");
class CaratController {
    // GET /carat/perguntas
    perguntas(_req, res) {
        res.json({ perguntas: carat_1.PERGUNTAS_CARAT });
    }
    // POST /carat/avaliacoes
    submeter(req, res) {
        const { respostas, utente_id } = req.body;
        const user = req.utilizador; // pode ser undefined (anónimo) — definido na rota
        if (!respostas || !Array.isArray(respostas)) {
            res.status(400).json({ erro: 'O campo "respostas" é obrigatório e deve ser um array.' });
            return;
        }
        let score;
        try {
            score = (0, carat_1.calcularScore)(respostas);
        }
        catch (e) {
            res.status(400).json({ erro: e.message });
            return;
        }
        const nivel = (0, carat_1.interpretarScore)(score);
        const recomendacoes = (0, carat_1.gerarRecomendacoes)(nivel);
        const proximoPasso = (0, carat_1.calcularProximoPasso)(nivel);
        const db = (0, db_1.getDb)();
        // Determinar utente_id real
        let utenteIdFinal = null;
        let medicoIdFinal = null;
        const anonima = !user;
        if (!anonima && user) {
            if (user.perfil === entities_1.PerfilUtilizador.UTENTE) {
                utenteIdFinal = user.id;
                // obter médico associado
                const ut = db.prepare('SELECT medico_id FROM utentes WHERE id=?').get(user.id);
                medicoIdFinal = ut?.medico_id ?? null;
            }
            else if (user.perfil === entities_1.PerfilUtilizador.MEDICO) {
                // médico faz avaliação em consulta — utente_id deve vir no body
                if (!utente_id) {
                    res.status(400).json({ erro: 'O campo "utente_id" é obrigatório quando o médico submete a avaliação.' });
                    return;
                }
                utenteIdFinal = utente_id;
                medicoIdFinal = user.id;
            }
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        // Só persistir se não for anónimo
        if (!anonima && utenteIdFinal) {
            // Score da avaliação anterior para detetar deterioração
            const anterior = db.prepare('SELECT score FROM avaliacoes_carat WHERE utente_id=? ORDER BY data DESC LIMIT 1').get(utenteIdFinal);
            db.prepare(`
        INSERT INTO avaliacoes_carat
          (id,utente_id,medico_id,data,respostas,score,nivel_controlo,recomendacoes,proximo_passo_semanas,anonima,criado_em)
        VALUES (?,?,?,?,?,?,?,?,?,0,?)
      `).run(id, utenteIdFinal, medicoIdFinal, now.split('T')[0], JSON.stringify(respostas), score, nivel, recomendacoes, proximoPasso, now);
            (0, carat_1.gerarAlertasSeNecessario)(id, utenteIdFinal, medicoIdFinal, score, anterior?.score ?? null);
            (0, auditoria_1.registarAuditoria)(user.id, 'SUBMETER_CARAT', 'avaliacoes_carat', id, { score, nivel });
        }
        res.status(anonima ? 200 : 201).json({
            id: anonima ? null : id,
            score,
            nivel_controlo: nivel,
            recomendacoes,
            proximo_passo_semanas: proximoPasso,
            anonima,
            persistida: !anonima,
        });
    }
    // GET /carat/avaliacoes/utente/:utenteId
    historico(req, res) {
        const db = (0, db_1.getDb)();
        const utenteId = req.params.utenteId;
        const avaliacoes = db.prepare(`
      SELECT * FROM avaliacoes_carat WHERE utente_id=? ORDER BY data DESC
    `).all(utenteId).map((a) => ({
            ...a,
            respostas: JSON.parse(a.respostas),
        }));
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'VER_HISTORICO_CARAT', 'avaliacoes_carat', utenteId);
        res.json(avaliacoes);
    }
    // GET /carat/avaliacoes/:id
    obter(req, res) {
        const db = (0, db_1.getDb)();
        const avaliacaoId = req.params.id;
        const av = db.prepare('SELECT * FROM avaliacoes_carat WHERE id=?').get(avaliacaoId);
        if (!av) {
            res.status(404).json({ erro: 'Avaliação não encontrada.' });
            return;
        }
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'VER_AVALIACAO_CARAT', 'avaliacoes_carat', avaliacaoId);
        res.json({ ...av, respostas: JSON.parse(av.respostas) });
    }
}
exports.CaratController = CaratController;

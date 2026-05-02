"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtenteController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const auditoria_1 = require("../services/auditoria");
const entities_1 = require("../models/entities");
class UtenteController {
    // GET /utentes
    listar(req, res) {
        const db = (0, db_1.getDb)();
        const user = req.utilizador;
        let utentes;
        if (user.perfil === entities_1.PerfilUtilizador.ADMINISTRADOR) {
            utentes = db.prepare(`
        SELECT u.id, u.nome, u.email, u.ativo, u.criado_em,
               ut.data_nascimento, ut.nif, ut.telefone, ut.medico_id,
               m.nome AS medico_nome
        FROM utilizadores u
        JOIN utentes ut ON u.id = ut.id
        LEFT JOIN utilizadores m ON m.id = ut.medico_id
        ORDER BY u.nome
      `).all();
        }
        else {
            // Médico vê só os seus utentes
            utentes = db.prepare(`
        SELECT u.id, u.nome, u.email, u.ativo, u.criado_em,
               ut.data_nascimento, ut.nif, ut.telefone, ut.medico_id
        FROM utilizadores u
        JOIN utentes ut ON u.id = ut.id
        WHERE ut.medico_id = ?
        ORDER BY u.nome
      `).all(user.id);
        }
        (0, auditoria_1.registarAuditoria)(user.id, 'LISTAR', 'utentes');
        res.json(utentes);
    }
    // GET /utentes/:id
    obter(req, res) {
        const db = (0, db_1.getDb)();
        const user = req.utilizador;
        const utente = db.prepare(`
      SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, u.atualizado_em,
             ut.data_nascimento, ut.nif, ut.telefone, ut.medico_id,
             m.nome AS medico_nome
      FROM utilizadores u
      JOIN utentes ut ON u.id = ut.id
      LEFT JOIN utilizadores m ON m.id = ut.medico_id
      WHERE u.id = ?
    `).get(req.params.id);
        if (!utente) {
            res.status(404).json({ erro: 'Utente não encontrado.' });
            return;
        }
        // Administrador só vê dados administrativos (sem dados clínicos)
        if (user.perfil === entities_1.PerfilUtilizador.ADMINISTRADOR) {
            const { data_nascimento, nif, telefone, medico_id, medico_nome, ...dadosAdmin } = utente;
            (0, auditoria_1.registarAuditoria)(user.id, 'VER_DETALHE_ADMIN', 'utentes', utente.id);
            res.json({ ...dadosAdmin, data_nascimento, nif, telefone, medico_id, medico_nome });
            return;
        }
        // Médico/Utente vê tudo (dados clínicos incluídos)
        (0, auditoria_1.registarAuditoria)(user.id, 'VER_DETALHE', 'utentes', utente.id);
        res.json(utente);
    }
    // POST /utentes  (Admin only)
    criar(req, res) {
        const { nome, email, password, data_nascimento, nif, telefone, medico_id } = req.body;
        if (!nome || !email || !password || !data_nascimento || !nif || !telefone || !medico_id) {
            res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
            return;
        }
        const db = (0, db_1.getDb)();
        // Verificar que o médico existe
        const medico = db.prepare("SELECT id FROM utilizadores WHERE id = ? AND perfil = 'MEDICO'")
            .get(medico_id);
        if (!medico) {
            res.status(400).json({ erro: 'Médico não encontrado.' });
            return;
        }
        // Verificar email duplicado
        if (db.prepare('SELECT id FROM utilizadores WHERE email = ?').get(email)) {
            res.status(409).json({ erro: 'Já existe um utilizador com esse email.' });
            return;
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const hash = bcryptjs_1.default.hashSync(password, 10);
        const inserirUtil = db.prepare(`
      INSERT INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
      VALUES (?,?,?,?,?,1,?,?)
    `);
        const inserirUtente = db.prepare(`
      INSERT INTO utentes (id,data_nascimento,nif,telefone,medico_id)
      VALUES (?,?,?,?,?)
    `);
        db.transaction(() => {
            inserirUtil.run(id, nome, email, hash, entities_1.PerfilUtilizador.UTENTE, now, now);
            inserirUtente.run(id, data_nascimento, nif, telefone, medico_id);
        })();
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'CRIAR', 'utentes', id, { nome, email });
        res.status(201).json({ id, nome, email, perfil: 'UTENTE', medico_id });
    }
    // PUT /utentes/:id
    atualizar(req, res) {
        const db = (0, db_1.getDb)();
        const utenteId = req.params.id;
        const { nome, telefone, data_nascimento } = req.body;
        const now = new Date().toISOString();
        if (!db.prepare('SELECT id FROM utilizadores WHERE id = ?').get(utenteId)) {
            res.status(404).json({ erro: 'Utente não encontrado.' });
            return;
        }
        if (nome)
            db.prepare('UPDATE utilizadores SET nome=?, atualizado_em=? WHERE id=?').run(nome, now, utenteId);
        if (telefone)
            db.prepare('UPDATE utentes SET telefone=? WHERE id=?').run(telefone, utenteId);
        if (data_nascimento)
            db.prepare('UPDATE utentes SET data_nascimento=? WHERE id=?').run(data_nascimento, utenteId);
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'ATUALIZAR', 'utentes', utenteId, { nome, telefone });
        res.json({ mensagem: 'Utente atualizado com sucesso.' });
    }
    // DELETE /utentes/:id  (Admin only — anonimização)
    remover(req, res) {
        const db = (0, db_1.getDb)();
        const utenteId = req.params.id;
        const { motivo } = req.body;
        if (!motivo || !Object.values(entities_1.MotivoRemocaoUtente).includes(motivo)) {
            res.status(400).json({ erro: `Motivo inválido. Use: ${Object.values(entities_1.MotivoRemocaoUtente).join(', ')}` });
            return;
        }
        if (!db.prepare('SELECT id FROM utilizadores WHERE id = ?').get(utenteId)) {
            res.status(404).json({ erro: 'Utente não encontrado.' });
            return;
        }
        const now = new Date().toISOString();
        const nomeAnonimo = `[Removido_${utenteId.substring(0, 8)}]`;
        // Anonimizar dados identificativos, manter dados clínicos
        db.transaction(() => {
            db.prepare(`UPDATE utilizadores SET nome=?, email=?, password_hash=?, ativo=0, atualizado_em=? WHERE id=?`)
                .run(nomeAnonimo, `removido_${utenteId}@anonimo.pt`, '[REMOVIDO]', now, utenteId);
            db.prepare(`UPDATE utentes SET nif='[REMOVIDO]', telefone='[REMOVIDO]' WHERE id=?`)
                .run(utenteId);
        })();
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'REMOVER_ANONIMIZAR', 'utentes', utenteId, { motivo });
        res.json({ mensagem: 'Utente removido. Dados clínicos mantidos de forma anonimizada.' });
    }
    // GET /utentes/:id/historico-clinico
    historicoClinico(req, res) {
        const db = (0, db_1.getDb)();
        const utenteId = req.params.id;
        const avaliacoes = db.prepare('SELECT * FROM avaliacoes_carat WHERE utente_id = ? ORDER BY data DESC').all(utenteId);
        const medicacao = db.prepare('SELECT * FROM medicacao WHERE utente_id = ? ORDER BY data_inicio DESC').all(utenteId);
        const exames = db.prepare('SELECT * FROM exames WHERE utente_id = ? ORDER BY data DESC').all(utenteId);
        const alertas = db.prepare('SELECT * FROM alertas WHERE utente_id = ? ORDER BY criado_em DESC').all(utenteId);
        (0, auditoria_1.registarAuditoria)(req.utilizador.id, 'VER_HISTORICO_CLINICO', 'utentes', utenteId);
        res.json({ avaliacoes, medicacao, exames, alertas });
    }
}
exports.UtenteController = UtenteController;

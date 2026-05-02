import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db';
import { registarAuditoria } from '../services/auditoria';
import { PerfilUtilizador } from '../models/entities';

export class MedicoController {
  // GET /medicos
  listar(req: Request, res: Response): void {
    const db = getDb();
    const medicos = db.prepare(`
      SELECT u.id, u.nome, u.email, u.ativo, u.criado_em,
             m.numero_cedula, m.especialidade,
             COUNT(ut.id) AS total_utentes
      FROM utilizadores u
      JOIN medicos m ON u.id = m.id
      LEFT JOIN utentes ut ON ut.medico_id = u.id
      GROUP BY u.id
      ORDER BY u.nome
    `).all();

    registarAuditoria(req.utilizador!.id, 'LISTAR', 'medicos');
    res.json(medicos);
  }

  // GET /medicos/:id
  obter(req: Request, res: Response): void {
    const db = getDb();
    const medico = db.prepare(`
      SELECT u.id, u.nome, u.email, u.ativo, u.criado_em, u.atualizado_em,
             m.numero_cedula, m.especialidade
      FROM utilizadores u
      JOIN medicos m ON u.id = m.id
      WHERE u.id = ?
    `).get(req.params.id) as any;

    if (!medico) { res.status(404).json({ erro: 'Médico não encontrado.' }); return; }

    const utentes = db.prepare(`
      SELECT u.id, u.nome, u.email, u.ativo
      FROM utilizadores u
      JOIN utentes ut ON u.id = ut.id
      WHERE ut.medico_id = ?
      ORDER BY u.nome
    `).all(req.params.id);

    registarAuditoria(req.utilizador!.id, 'VER_DETALHE', 'medicos', req.params.id as string);
    res.json({ ...medico, utentes });
  }

  // POST /medicos  (Admin only)
  criar(req: Request, res: Response): void {
    const { nome, email, password, numero_cedula, especialidade } = req.body;

    if (!nome || !email || !password || !numero_cedula || !especialidade) {
      res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
      return;
    }

    const db = getDb();
    if (db.prepare('SELECT id FROM utilizadores WHERE email = ?').get(email)) {
      res.status(409).json({ erro: 'Já existe um utilizador com esse email.' });
      return;
    }
    if (db.prepare('SELECT id FROM medicos WHERE numero_cedula = ?').get(numero_cedula)) {
      res.status(409).json({ erro: 'Número de cédula já registado.' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const hash = bcrypt.hashSync(password, 10);

    db.transaction(() => {
      db.prepare(`INSERT INTO utilizadores (id,nome,email,password_hash,perfil,ativo,criado_em,atualizado_em)
        VALUES (?,?,?,?,?,1,?,?)`).run(id, nome, email, hash, PerfilUtilizador.MEDICO, now, now);
      db.prepare(`INSERT INTO medicos (id,numero_cedula,especialidade) VALUES (?,?,?)`)
        .run(id, numero_cedula, especialidade);
    })();

    registarAuditoria(req.utilizador!.id, 'CRIAR', 'medicos', id, { nome, email, numero_cedula });
    res.status(201).json({ id, nome, email, perfil: 'MEDICO', numero_cedula, especialidade });
  }

  // PUT /medicos/:id  (Admin only)
  atualizar(req: Request, res: Response): void {
    const db = getDb();
    const medicoId = req.params.id;
    const { nome, especialidade } = req.body;
    const now = new Date().toISOString();

    if (!db.prepare("SELECT id FROM utilizadores WHERE id = ? AND perfil='MEDICO'").get(medicoId)) {
      res.status(404).json({ erro: 'Médico não encontrado.' });
      return;
    }

    if (nome) db.prepare('UPDATE utilizadores SET nome=?, atualizado_em=? WHERE id=?').run(nome, now, medicoId);
    if (especialidade) db.prepare('UPDATE medicos SET especialidade=? WHERE id=?').run(especialidade, medicoId);

    registarAuditoria(req.utilizador!.id, 'ATUALIZAR', 'medicos', medicoId as string, { nome, especialidade });
    res.json({ mensagem: 'Médico atualizado com sucesso.' });
  }

  // PATCH /medicos/:id/inativar  (Admin only)
  inativar(req: Request, res: Response): void {
    const db = getDb();
    const medicoId = req.params.id;

    if (!db.prepare("SELECT id FROM utilizadores WHERE id = ? AND perfil='MEDICO'").get(medicoId)) {
      res.status(404).json({ erro: 'Médico não encontrado.' });
      return;
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE utilizadores SET ativo=0, atualizado_em=? WHERE id=?').run(now, medicoId);

    // Utentes que ficam sem médico
    const utentesSemMedico = db.prepare(`
      SELECT u.id, u.nome FROM utilizadores u
      JOIN utentes ut ON u.id = ut.id
      WHERE ut.medico_id = ?
    `).all(medicoId);

    registarAuditoria(req.utilizador!.id, 'INATIVAR', 'medicos', medicoId as string);

    res.json({
      mensagem: 'Médico inativado.',
      utentes_a_reassociar: utentesSemMedico,
      aviso: utentesSemMedico.length > 0
        ? `${utentesSemMedico.length} utente(s) necessitam de ser associados a outro médico.`
        : null,
    });
  }

  // PATCH /medicos/:id/utentes/:utenteId/reassociar  (Admin only)
  reassociarUtente(req: Request, res: Response): void {
    const { utenteId } = req.params;
    const { novo_medico_id } = req.body;
    const db = getDb();

    if (!db.prepare("SELECT id FROM utilizadores WHERE id = ? AND perfil='MEDICO' AND ativo=1").get(novo_medico_id)) {
      res.status(400).json({ erro: 'Novo médico não encontrado ou inativo.' });
      return;
    }

    db.prepare('UPDATE utentes SET medico_id=? WHERE id=?').run(novo_medico_id, utenteId);
    registarAuditoria(req.utilizador!.id, 'REASSOCIAR_UTENTE', 'utentes', utenteId as string, { novo_medico_id });
    res.json({ mensagem: 'Utente reassociado com sucesso.' });
  }
}

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/utentes', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const utentes = req.user?.role === 'medico'
      ? db.prepare('SELECT id, nome, username, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id FROM utente WHERE medico_id = ?').all(req.user.id)
      : db.prepare('SELECT id, nome, username, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id FROM utente').all();
    return res.json(utentes);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/utente/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(Number(req.params.id));
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
    return res.json(utente);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/medicos', authMiddleware, (_req, res: Response) => {
  try {
    return res.json(db.prepare('SELECT id, nome, especialidade FROM medico').all());
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.post('/utente', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { nome, username, password, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id } = req.body;
    if (db.prepare('SELECT id FROM utente WHERE username = ?').get(username)) {
      return res.status(409).json({ erro: 'Username já existe.' });
    }
    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO utente (nome, username, password_hash, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      nome, username, bcrypt.hashSync(password, 10),
      sexo || null, idade ? Number(idade) : null,
      (diagnostico_asma === true || diagnostico_asma === 'true') ? 1 : 0,
      data_primeira_consulta || null, medico_id ? Number(medico_id) : null,
      now, now
    );
    return res.status(201).json({ mensagem: 'Utente criado com sucesso.', id: result.lastInsertRowid });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

router.post('/medico', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { nome, username, password, especialidade, numero_cedula } = req.body;
    if (db.prepare('SELECT id FROM medico WHERE username = ?').get(username))
      return res.status(409).json({ erro: 'Username já existe.' });
    if (numero_cedula && db.prepare('SELECT id FROM medico WHERE numero_cedula = ?').get(numero_cedula))
      return res.status(409).json({ erro: 'Cédula profissional já registada noutro médico.' });
    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO medico (nome, username, password_hash, especialidade, numero_cedula, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(nome, username, bcrypt.hashSync(password, 10), especialidade || 'Medicina Geral', numero_cedula || null, now, now);
    return res.status(201).json({ mensagem: 'Médico criado com sucesso.', id: result.lastInsertRowid });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

router.get('/perfil', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
    const row = db.prepare('SELECT id, nome, username, email, telefone, data_nascimento, nif, morada, alergia, sexo, idade FROM utente WHERE id = ?').get(req.user.id);
    return res.json(row);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.put('/perfil', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
    const { email, telefone, data_nascimento, nif, morada, alergia } = req.body;
    db.prepare('UPDATE utente SET email=?, telefone=?, data_nascimento=?, nif=?, morada=?, alergia=?, dataAtualizacao=? WHERE id=?')
      .run(email || null, telefone || null, data_nascimento || null, nif || null, morada || null, alergia || null, new Date().toISOString(), req.user.id);
    return res.json({ mensagem: 'Dados pessoais atualizados com sucesso.' });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

export default router;

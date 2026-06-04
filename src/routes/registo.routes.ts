import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/database';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { auditoriaService } from '../services/auditoria.service';

const router = Router();

const ip = (req: Request) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

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
    const { nome, username, password, sexo, data_nascimento, diagnostico_asma, data_primeira_consulta, medico_id } = req.body;
    if (db.prepare('SELECT id FROM utente WHERE username = ?').get(username))
      return res.status(409).json({ erro: 'Username já existe.' });

    let idade: number | null = null;
    if (data_nascimento) {
      const nasc = new Date(data_nascimento), hoje = new Date();
      let i = hoje.getFullYear() - nasc.getFullYear();
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--;
      idade = i >= 0 ? i : 0;
    }
    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO utente (nome, username, password_hash, sexo, idade, data_nascimento, diagnostico_asma, data_primeira_consulta, medico_id, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      nome, username, bcrypt.hashSync(password, 10),
      sexo || null, idade, data_nascimento || null,
      (diagnostico_asma === true || diagnostico_asma === 'true') ? 1 : 0,
      data_primeira_consulta || null, medico_id ? Number(medico_id) : null,
      now, now
    );

    auditoriaService.criarUtente(
      req.user!.id, req.user!.nome, req.user!.role,
      Number(result.lastInsertRowid),
      { nome, username, sexo, diagnostico_asma, medico_id },
      ip(req)
    );

    return res.status(201).json({ mensagem: 'Utente criado com sucesso.', id: result.lastInsertRowid });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

router.post('/medico', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { nome, username, password, especialidade, numero_cedula } = req.body;
    if (db.prepare('SELECT id FROM medico WHERE username = ?').get(username))
      return res.status(409).json({ erro: 'Username já existe.' });
    const cedulaNorm = numero_cedula ? numero_cedula.toUpperCase() : null;
    if (cedulaNorm && db.prepare('SELECT id FROM medico WHERE UPPER(numero_cedula) = ?').get(cedulaNorm))
      return res.status(409).json({ erro: 'Cédula profissional já registada noutro médico.' });

    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO medico (nome, username, password_hash, especialidade, numero_cedula, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(nome, username, bcrypt.hashSync(password, 10), especialidade || 'Medicina Geral', cedulaNorm, now, now);

    auditoriaService.criarMedico(
      req.user!.id, req.user!.nome, req.user!.role,
      Number(result.lastInsertRowid),
      { nome, username, especialidade, numero_cedula: cedulaNorm },
      ip(req)
    );

    return res.status(201).json({ mensagem: 'Médico criado com sucesso.', id: result.lastInsertRowid });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

router.get('/perfil', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
    const row = db.prepare(
      'SELECT id, nome, username, email, telefone, data_nascimento, nif, rua, numero_porta, codigo_postal, localidade, alergia, sexo, idade FROM utente WHERE id = ?'
    ).get(req.user.id);
    return res.json(row);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.put('/perfil', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
    const { email, telefone, data_nascimento, nif, rua, numero_porta, codigo_postal, localidade, alergia } = req.body;
    const existing = db.prepare('SELECT data_nascimento, nome FROM utente WHERE id = ?').get(req.user.id) as any;
    const nascFinal = existing.data_nascimento || data_nascimento || null;
    let idadeFinal: number | null = null;
    if (nascFinal) {
      const nasc = new Date(nascFinal), hoje = new Date();
      let i = hoje.getFullYear() - nasc.getFullYear();
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--;
      idadeFinal = i >= 0 ? i : null;
    }
    db.prepare(
      'UPDATE utente SET email=?, telefone=?, data_nascimento=?, nif=?, rua=?, numero_porta=?, codigo_postal=?, localidade=?, alergia=?, idade=?, dataAtualizacao=? WHERE id=?'
    ).run(email||null, telefone||null, nascFinal, nif||null, rua||null, numero_porta||null, codigo_postal||null, localidade||null, alergia||null, idadeFinal, new Date().toISOString(), req.user.id);

    const campos: Record<string, unknown> = {};
    if (email !== undefined) campos.email = email;
    if (telefone !== undefined) campos.telefone = telefone;
    if (data_nascimento !== undefined) campos.data_nascimento = data_nascimento;
    if (nif !== undefined) campos.nif = nif;
    if (rua !== undefined) campos.rua = rua;
    if (numero_porta !== undefined) campos.numero_porta = numero_porta;
    if (codigo_postal !== undefined) campos.codigo_postal = codigo_postal;
    if (localidade !== undefined) campos.localidade = localidade;
    if (alergia !== undefined) campos.alergia = alergia;

    auditoriaService.atualizarPerfilUtente(req.user.id, existing.nome, campos, ip(req));

    return res.json({ mensagem: 'Dados pessoais atualizados com sucesso.' });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/database';
import { Utente }  from '../models/utente.entity';
import { Medico }  from '../models/medico.entity';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /registo/utentes — lista todos os utentes (para dropdown do médico)
router.get('/utentes', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Utente);
    let utentes;
    if (req.user?.role === 'medico') {
      utentes = await repo.find({ where: { medico_id: req.user.id } });
    } else {
      utentes = await repo.find();
    }
    return res.json(utentes.map(u => ({
      id: u.id, nome: u.nome, username: u.username,
      sexo: u.sexo, idade: u.idade,
      diagnostico_asma: u.diagnostico_asma,
      data_primeira_consulta: u.data_primeira_consulta,
      medico_id: u.medico_id
    })));
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

// GET /registo/utente/:id — dados clínicos de um utente
router.get('/utente/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const utente = await AppDataSource.getRepository(Utente).findOne({ where: { id: Number(req.params.id) } });
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
    return res.json(utente);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

// GET /registo/medicos — lista médicos (para dropdown ao criar utente)
router.get('/medicos', authMiddleware, async (_req, res: Response) => {
  try {
    const medicos = await AppDataSource.getRepository(Medico).find();
    return res.json(medicos.map(m => ({ id: m.id, nome: m.nome, especialidade: m.especialidade })));
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

// POST /registo/utente — criar utente
router.post('/utente', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, username, password, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id } = req.body;
    const repo = AppDataSource.getRepository(Utente);
    if (await repo.findOne({ where: { username } })) {
      return res.status(409).json({ erro: 'Username já existe.' });
    }
    
    
    if (medico_id) {
      const med = await AppDataSource.getRepository(Medico).findOne({ where: { id: Number(medico_id) } });
    }
    const novo = repo.create({
      nome, username,
      password_hash: bcrypt.hashSync(password, 10),
      sexo: sexo || null,
      idade: idade ? Number(idade) : null,
      diagnostico_asma: diagnostico_asma === true || diagnostico_asma === 'true',
      data_primeira_consulta: data_primeira_consulta || null,
      medico_id: medico_id ? Number(medico_id) : null,
      nif: null, telefone: null,
      ativo: true,
      dataCriacao: new Date(), dataAtualizacao: new Date()
    });
    const guardado = await repo.save(novo as Utente);
    return res.status(201).json({ mensagem: 'Utente criado com sucesso.', id: guardado.id });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

// POST /registo/medico — criar médico
router.post('/medico', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id, nome, username, password, especialidade, numero_cedula } = req.body;
    const repo = AppDataSource.getRepository(Medico);
    if (await repo.findOne({ where: { username } })) {
      return res.status(409).json({ erro: 'Username já existe.' });
    }
    const novo = repo.create({
      id: undefined, 
      nome, username,
      password_hash: bcrypt.hashSync(password, 10),
      especialidade: especialidade || 'Medicina Geral',
      numero_cedula: numero_cedula || null,
      ativo: true,
      dataCriacao: new Date(), dataAtualizacao: new Date()
    });
    const guardado = await repo.save(novo as Medico);
    return res.status(201).json({ mensagem: 'Médico criado com sucesso.', id: guardado.id });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

export default router;
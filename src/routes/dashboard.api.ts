import { Router, Response } from 'express';
import { In, Not } from 'typeorm';
import { AppDataSource } from '../database/database';
import { Utente } from '../models/utente.entity';
import { Medico } from '../models/medico.entity';
import { Alerta } from '../models/alerta.entity';
import { Medicacao } from '../models/medicacao.entity';
import { AvaliacaoCARAT } from '../models/carat.entity';
import { Exame } from '../models/exame.entity';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// GET /dashboard/utente/:userId — dados clínicos e histórico CARAT para o utente
router.get('/utente/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (req.user?.role === 'utente' && req.user.id !== userId) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    const utenteRepo = AppDataSource.getRepository(Utente);
    const utente = await utenteRepo.findOne({ where: { id: userId } });
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });

    if (req.user?.role === 'medico' && utente.medico_id !== req.user.id) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    const avalRepo = AppDataSource.getRepository(AvaliacaoCARAT);
    const alertRepo = AppDataSource.getRepository(Alerta);
    const medRepo = AppDataSource.getRepository(Medicacao);
    const exameRepo = AppDataSource.getRepository(Exame);

    const [avaliacoes, alertas, medicacoes, exames] = await Promise.all([
      avalRepo.find({ where: { utente_id: userId }, order: { dataCriacao: 'DESC' } }),
      alertRepo.find({ where: { utente_id: userId, estado: Not('FECHADO') }, order: { dataCriacao: 'DESC' } }),
      medRepo.find({ where: { utente_id: userId, estado: 'ATIVA' }, order: { dataCriacao: 'DESC' } }),
      exameRepo.find({ where: { utente_id: userId }, order: { data_criacao: 'DESC' } }),
    ]);

    return res.json({
      utente: {
        id: utente.id,
        nome: utente.nome,
        sexo: utente.sexo,
        idade: utente.idade,
        diagnostico_asma: utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta,
        medico_id: utente.medico_id,
      },
      carats: avaliacoes.map(c => ({
        id: c.id,
        scoreTotal: c.scoreTotal,
        scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma,
        controloTotal: c.nivelControlo,
        recomendacao: c.recomendacao,
        proximoPassoSemanas: c.proximoPassoSemanas,
        dataCriacao: c.dataCriacao,
      })),
      exames,
      alertas,
      ultimoCarat: avaliacoes.length ? {
        id: avaliacoes[0].id,
        scoreTotal: avaliacoes[0].scoreTotal,
        scoreRinite: avaliacoes[0].scoreRinite,
        scoreAsma: avaliacoes[0].scoreAsma,
        controloTotal: avaliacoes[0].nivelControlo,
        recomendacao: avaliacoes[0].recomendacao,
        proximoPassoSemanas: avaliacoes[0].proximoPassoSemanas,
        dataCriacao: avaliacoes[0].dataCriacao,
      } : null,
      totalExames: exames.length,
      totalCarats: avaliacoes.length,
    });
  } catch (e: any) {
    return res.status(500).json({ erro: e.message });
  }
});

// GET /dashboard/medico/:medicoId — lista utentes e alertas ativos para o médico
router.get('/medico/:medicoId', authMiddleware, authorize(['medico']), async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = Number(req.params.medicoId);
    if (req.user?.id !== medicoId) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    const utenteRepo = AppDataSource.getRepository(Utente);
    const alertRepo = AppDataSource.getRepository(Alerta);

    const utentes = await utenteRepo.find({ where: { medico_id: medicoId } });
    const utenteIds = utentes.map(u => u.id);

    const alertas = utenteIds.length
      ? await alertRepo.find({ where: { utente_id: In(utenteIds), estado: Not('FECHADO') }, order: { dataCriacao: 'DESC' } })
      : [];

    return res.json({
      utentes: utentes.map(u => ({
        id: u.id,
        nome: u.nome,
        username: u.username,
        sexo: u.sexo,
        idade: u.idade,
        medico_id: u.medico_id,
      })),
      alertas,
    });
  } catch (e: any) {
    return res.status(500).json({ erro: e.message });
  }
});

// GET /dashboard/admin/stats — estatísticas do painel de administração
router.get('/admin/stats', authMiddleware, authorize(['administrador']), async (_req, res: Response) => {
  try {
    const utentes = await AppDataSource.getRepository(Utente).count();
    const medicos = await AppDataSource.getRepository(Medico).count();
    const avaliacoes = await AppDataSource.getRepository(AvaliacaoCARAT).count();
    const alertas = await AppDataSource.getRepository(Alerta).count({ where: { estado: Not('FECHADO') } });

    return res.json({ utentes, medicos, avaliacoes, alertas });
  } catch (e: any) {
    return res.status(500).json({ erro: e.message });
  }
});

export default router;

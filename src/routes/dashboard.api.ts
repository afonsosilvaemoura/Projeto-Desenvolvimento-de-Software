import { Router, Response } from 'express';
import { db } from '../database/database';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/utente/:userId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (req.user?.role === 'utente' && req.user.id !== userId) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(userId) as any;
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
    if (req.user?.role === 'medico' && utente.medico_id !== req.user.id) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    const avaliacoes = db.prepare('SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC').all(userId) as any[];
    const alertas = db.prepare("SELECT * FROM alerta WHERE utente_id = ? AND estado != 'FECHADO' ORDER BY dataCriacao DESC").all(userId);
    const exames = db.prepare('SELECT * FROM exame WHERE utente_id = ? ORDER BY data_criacao DESC').all(userId);

    return res.json({
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        diagnostico_asma: !!utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta, medico_id: utente.medico_id,
      },
      carats: avaliacoes.map(c => ({
        id: c.id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma, controloTotal: c.nivelControlo,
        recomendacao: c.recomendacao, proximoPassoSemanas: c.proximoPassoSemanas,
        dataCriacao: c.dataCriacao,
      })),
      exames, alertas,
      ultimoCarat: avaliacoes.length ? {
        id: avaliacoes[0].id, scoreTotal: avaliacoes[0].scoreTotal,
        scoreRinite: avaliacoes[0].scoreRinite, scoreAsma: avaliacoes[0].scoreAsma,
        controloTotal: avaliacoes[0].nivelControlo, recomendacao: avaliacoes[0].recomendacao,
        proximoPassoSemanas: avaliacoes[0].proximoPassoSemanas, dataCriacao: avaliacoes[0].dataCriacao,
      } : null,
      totalExames: (exames as any[]).length,
      totalCarats: avaliacoes.length,
    });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/medico/alertas-utentes', authMiddleware, authorize(['medico']), (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user!.id;
    const utentes = db.prepare('SELECT id, nome FROM utente WHERE medico_id = ? AND ativo = 1').all(medicoId) as any[];
    if (!utentes.length) return res.json([]);
    const ph = utentes.map(() => '?').join(',');
    const alertas = db.prepare(`
      SELECT a.id, a.utente_id, a.tipo, a.prioridade, a.motivo, a.estado, a.dataCriacao,
             u.nome as utente_nome,
             (SELECT scoreTotal FROM avaliacao_carat WHERE utente_id = a.utente_id ORDER BY dataCriacao DESC LIMIT 1) as ultimo_score
      FROM alerta a JOIN utente u ON a.utente_id = u.id
      WHERE a.utente_id IN (${ph}) AND a.estado = 'NOVO'
      ORDER BY CASE a.prioridade WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 ELSE 3 END, a.dataCriacao DESC
    `).all(...utentes.map(u => u.id));
    return res.json(alertas);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/medico/:medicoId', authMiddleware, authorize(['medico']), (req: AuthRequest, res: Response) => {
  try {
    const medicoId = Number(req.params.medicoId);
    if (req.user?.id !== medicoId) return res.status(403).json({ erro: 'Acesso negado.' });

    const utentes = db.prepare('SELECT id, nome, username, sexo, idade, medico_id FROM utente WHERE medico_id = ?').all(medicoId) as any[];
    let alertas: any[] = [];
    if (utentes.length) {
      const ph = utentes.map(() => '?').join(',');
      alertas = db.prepare(`SELECT * FROM alerta WHERE utente_id IN (${ph}) AND estado != 'FECHADO' ORDER BY dataCriacao DESC`).all(...utentes.map(u => u.id));
    }
    return res.json({ utentes, alertas });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/admin/stats', authMiddleware, authorize(['administrador']), (_req, res: Response) => {
  try {
    return res.json({
      utentes:    (db.prepare('SELECT COUNT(*) as c FROM utente').get() as any).c,
      medicos:    (db.prepare('SELECT COUNT(*) as c FROM medico').get() as any).c,
      avaliacoes: (db.prepare('SELECT COUNT(*) as c FROM avaliacao_carat').get() as any).c,
      alertas:    (db.prepare("SELECT COUNT(*) as c FROM alerta WHERE estado != 'FECHADO'").get() as any).c,
    });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default router;

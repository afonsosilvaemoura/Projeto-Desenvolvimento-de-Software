import { Router, Response } from 'express';
import { db } from '../database/database';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const adminOnly = [authMiddleware, authorize(['administrador'])] as const;

router.get('/alertas', ...adminOnly, (_req, res: Response) => {
  try {
    return res.json(db.prepare('SELECT * FROM alerta ORDER BY dataCriacao DESC').all());
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/limiar', ...adminOnly, (_req, res: Response) => {
  try {
    let limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() as any;
    if (!limiar) {
      db.prepare('INSERT INTO limiar_alerta (scoreMinimo, deterioracaoPontos, dataAtualizacao) VALUES (24, 3, ?)').run(new Date().toISOString());
      limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get();
    }
    return res.json(limiar);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.put('/limiar', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const { scoreMinimo, deterioracaoPontos } = req.body;
    const now = new Date().toISOString();
    const limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() as any;
    if (!limiar) {
      db.prepare('INSERT INTO limiar_alerta (scoreMinimo, deterioracaoPontos, dataAtualizacao) VALUES (?, ?, ?)').run(Number(scoreMinimo), Number(deterioracaoPontos), now);
    } else {
      db.prepare('UPDATE limiar_alerta SET scoreMinimo=?, deterioracaoPontos=?, dataAtualizacao=? WHERE id=?').run(Number(scoreMinimo), Number(deterioracaoPontos), now, limiar.id);
    }
    return res.json({ mensagem: 'Limiar atualizado.', limiar: db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() });
  } catch (e: any) { return res.status(400).json({ erro: e.message }); }
});

router.get('/dashboard/:utenteId', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.utenteId);
    if (req.user?.role === 'utente' && req.user.id !== id) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(id) as any;
    if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });

    const carats = db.prepare('SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC').all(id) as any[];
    const exames = db.prepare('SELECT * FROM exame WHERE utente_id = ?').all(id);

    return res.json({
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        diagnostico_asma: !!utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta, medico_id: utente.medico_id,
      },
      carats: carats.map(c => ({
        id: c.id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma, controloTotal: c.nivelControlo, dataCriacao: c.dataCriacao,
      })),
      exames,
      ultimoCarat: carats.length ? {
        scoreTotal: carats[0].scoreTotal, scoreRinite: carats[0].scoreRinite,
        scoreAsma: carats[0].scoreAsma, controloTotal: carats[0].nivelControlo,
      } : null,
      totalExames: (exames as any[]).length,
      totalCarats: carats.length,
    });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default router;

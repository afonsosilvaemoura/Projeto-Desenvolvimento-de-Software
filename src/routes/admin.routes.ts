import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
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

router.get('/medicos', ...adminOnly, (_req, res: Response) => {
  try {
    return res.json(db.prepare('SELECT id, nome, username, especialidade, numero_cedula, ativo, dataCriacao FROM medico ORDER BY nome ASC').all());
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.patch('/medico/:id/ativo', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { ativo } = req.body;
    if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
    const medico = db.prepare('SELECT id FROM medico WHERE id = ?').get(id);
    if (!medico) return res.status(404).json({ erro: 'Médico não encontrado.' });
    db.prepare('UPDATE medico SET ativo = ?, dataAtualizacao = ? WHERE id = ?').run(ativo ? 1 : 0, new Date().toISOString(), id);
    return res.json({ mensagem: `Médico ${ativo ? 'ativado' : 'desativado'} com sucesso.` });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/utentes', ...adminOnly, (_req, res: Response) => {
  try {
    return res.json(db.prepare(`
      SELECT u.id, u.nome, u.username, u.sexo, u.idade, u.ativo, u.motivo_inativacao,
             u.medico_id, m.nome as medico_nome
      FROM utente u LEFT JOIN medico m ON u.medico_id = m.id
      ORDER BY u.nome ASC
    `).all());
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.patch('/utente/:id/ativo', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { ativo, motivo } = req.body;
    if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
    if (!db.prepare('SELECT id FROM utente WHERE id = ?').get(id)) return res.status(404).json({ erro: 'Utente não encontrado.' });
    db.prepare('UPDATE utente SET ativo = ?, motivo_inativacao = ?, dataAtualizacao = ? WHERE id = ?')
      .run(ativo ? 1 : 0, ativo ? null : (motivo || null), new Date().toISOString(), id);
    return res.json({ mensagem: `Utente ${ativo ? 'ativado' : 'desativado'} com sucesso.` });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.post('/medico/:id/desativar', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { password, novoMedicoId } = req.body;

    if (!password) return res.status(400).json({ erro: 'Password é obrigatória.' });

    const admin = db.prepare('SELECT * FROM administrador WHERE id = ?').get(req.user!.id) as any;
    if (!admin || !bcrypt.compareSync(password, admin.password_hash))
      return res.status(401).json({ erro: 'Password incorreta.' });

    const medico = db.prepare('SELECT * FROM medico WHERE id = ?').get(id) as any;
    if (!medico) return res.status(404).json({ erro: 'Médico não encontrado.' });

    const now = new Date().toISOString();
    let utentesMigrados = 0;

    const realocacoes: Array<{ utenteId: number; novoMedicoId: number }> = req.body.realocacoes || [];

    for (const r of realocacoes) {
      if (!db.prepare('SELECT id FROM medico WHERE id = ? AND ativo = 1').get(Number(r.novoMedicoId)))
        return res.status(400).json({ erro: `Médico destino ID ${r.novoMedicoId} não encontrado ou inativo.` });
    }
    for (const r of realocacoes) {
      db.prepare('UPDATE utente SET medico_id = ?, dataAtualizacao = ? WHERE id = ?')
        .run(Number(r.novoMedicoId), now, Number(r.utenteId));
      utentesMigrados++;
    }

    db.prepare('UPDATE medico SET ativo = 0, dataAtualizacao = ? WHERE id = ?').run(now, id);

    db.prepare('INSERT INTO auditoria (admin_id, admin_nome, acao, entidade, entidade_id, detalhes, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(req.user!.id, req.user!.nome, 'DESATIVAR_MEDICO', 'medico', id,
        JSON.stringify({ medicoNome: medico.nome, utentesMigrados, realocacoes }), now);

    return res.json({ mensagem: 'Médico desativado e auditoria registada.' });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.get('/medico/:id/utentes', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    return res.json(db.prepare('SELECT id, nome FROM utente WHERE medico_id = ? AND ativo = 1').all(Number(req.params.id)));
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

router.patch('/medico/:id/realocar', ...adminOnly, (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { novoMedicoId } = req.body;
    if (!novoMedicoId) return res.status(400).json({ erro: 'novoMedicoId é obrigatório.' });
    if (!db.prepare('SELECT id FROM medico WHERE id = ? AND ativo = 1').get(Number(novoMedicoId)))
      return res.status(400).json({ erro: 'Médico de destino não encontrado ou inativo.' });
    db.prepare('UPDATE utente SET medico_id = ?, dataAtualizacao = ? WHERE medico_id = ? AND ativo = 1')
      .run(Number(novoMedicoId), new Date().toISOString(), id);
    return res.json({ mensagem: 'Utentes realocados com sucesso.' });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
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
      alertasAtivos: (db.prepare("SELECT COUNT(*) as c FROM alerta WHERE utente_id = ? AND estado = 'NOVO'").get(id) as any).c,
      medicacoesAtivas: (db.prepare('SELECT COUNT(*) as c FROM prescricao WHERE utente_id = ? AND ativo = 1').get(id) as any).c,
    });
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../database/database';
import { authMiddleware, authorize, AuthRequest } from '../middleware/auth.middleware';
import { AlertaController } from '../controller/alerta.controller';
import { auditoriaService } from '../services/auditoria.service';

const ip = (req: Request) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

const router = Router();
const adminOnly = [authMiddleware, authorize(['administrador'])] as const;
const alertaController = new AlertaController();

// Alertas e limiares — lógica centralizada em AlertaService/AlertaController
router.get('/alertas', ...adminOnly, alertaController.getAllAlertas.bind(alertaController));
router.get('/limiar',  ...adminOnly, alertaController.getLimiar.bind(alertaController));
router.put('/limiar',  ...adminOnly, alertaController.updateLimiar.bind(alertaController));

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
    if (ativo) auditoriaService.ativarMedico(req.user!.id, req.user!.nome, id, ip(req));
    return res.json({ mensagem: `Médico ${ativo ? 'ativado' : 'inativado'} com sucesso.` });
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
    const { ativo, motivo, password } = req.body;
    if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
    if (!ativo) {
      if (!password) return res.status(400).json({ erro: 'Password é obrigatória para inativar.' });
      const admin = db.prepare('SELECT * FROM administrador WHERE id = ?').get(req.user!.id) as any;
      if (!admin || !bcrypt.compareSync(password, admin.password_hash))
        return res.status(401).json({ erro: 'Password incorreta.' });
    }
    if (!db.prepare('SELECT id FROM utente WHERE id = ?').get(id)) return res.status(404).json({ erro: 'Utente não encontrado.' });
    db.prepare('UPDATE utente SET ativo = ?, motivo_inativacao = ?, dataAtualizacao = ? WHERE id = ?')
      .run(ativo ? 1 : 0, ativo ? null : (motivo || null), new Date().toISOString(), id);
    if (ativo) auditoriaService.ativarUtente(req.user!.id, req.user!.nome, id, ip(req));
    else        auditoriaService.inativarUtente(req.user!.id, req.user!.nome, id, motivo || 'sem motivo', ip(req));
    return res.json({ mensagem: `Utente ${ativo ? 'ativado' : 'inativado'} com sucesso.` });
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

    auditoriaService.inativarMedico(
      req.user!.id, req.user!.nome, id,
      { medicoNome: medico.nome, utentesMigrados, realocacoes },
      ip(req)
    );

    return res.json({ mensagem: 'Médico inativado e auditoria registada.' });
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

    if (req.user?.role === 'medico' && (utente as any).medico_id !== req.user.id)
      return res.status(403).json({ erro: 'Acesso negado: utente não está atribuído a este médico.' });

    const carats = db.prepare('SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC').all(id) as any[];
    const exames = db.prepare(`
      SELECT e.*, m.nome as medico_nome
      FROM exame e LEFT JOIN medico m ON e.medico_id = m.id
      WHERE e.utente_id = ?
    `).all(id);
    const prescricoes = db.prepare('SELECT * FROM prescricao WHERE utente_id = ? ORDER BY data_criacao DESC').all(id);

    const payload = {
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        data_nascimento: utente.data_nascimento,
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
      prescricoes,
      totalExames: (exames as any[]).length,
      totalCarats: carats.length,
      alertasAtivos: (db.prepare("SELECT COUNT(*) as c FROM alerta WHERE utente_id = ? AND estado = 'NOVO'").get(id) as any).c,
      medicacoesAtivas: (db.prepare('SELECT COUNT(*) as c FROM prescricao WHERE utente_id = ? AND ativo = 1').get(id) as any).c,
    };

    if (req.user?.role !== 'utente') {
      auditoriaService.consultarDashboardUtente(
        req.user!.id, req.user!.nome, req.user!.role,
        id, utente.nome, ip(req)
      );
    }

    return res.json(payload);
  } catch (e: any) { return res.status(500).json({ erro: e.message }); }
});

export default router;

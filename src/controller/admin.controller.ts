import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AdminService } from '../services/admin.service';
import { auditoriaService } from '../services/auditoria.service';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class AdminController {
  private service = new AdminService();

  listarMedicos(_req: AuthRequest, res: Response) {
    try { return res.json(this.service.listarMedicos()); }
    catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  toggleMedico(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { ativo } = req.body;
      if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
      this.service.toggleMedico(id, ativo);
      if (ativo) auditoriaService.ativarMedico(req.user!.id, req.user!.nome, id, ip(req));
      return res.json({ mensagem: `Médico ${ativo ? 'ativado' : 'inativado'} com sucesso.` });
    } catch (e: any) { return res.status(e.message.includes('não encontrado') ? 404 : 500).json({ erro: e.message }); }
  }

  listarUtentes(_req: AuthRequest, res: Response) {
    try { return res.json(this.service.listarUtentes()); }
    catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  toggleUtente(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { ativo, motivo, password } = req.body;
      if (typeof ativo !== 'boolean') return res.status(400).json({ erro: 'Campo "ativo" deve ser boolean.' });
      this.service.toggleUtente(id, ativo, req.user!.id, password, motivo);
      if (ativo) auditoriaService.ativarUtente(req.user!.id, req.user!.nome, id, ip(req));
      else        auditoriaService.inativarUtente(req.user!.id, req.user!.nome, id, motivo || 'sem motivo', ip(req));
      return res.json({ mensagem: `Utente ${ativo ? 'ativado' : 'inativado'} com sucesso.` });
    } catch (e: any) {
      const status = e.message.includes('Password') ? 401 : e.message.includes('não encontrado') ? 404 : 500;
      return res.status(status).json({ erro: e.message });
    }
  }

  desativarMedico(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { password, realocacoes = [] } = req.body;
      const resultado = this.service.desativarMedico(id, req.user!.id, password, realocacoes);
      for (const r of realocacoes) {
        auditoriaService.realocacaoUtente(req.user!.id, req.user!.nome, Number(r.utenteId), Number(r.novoMedicoId), ip(req));
      }
      auditoriaService.inativarMedico(req.user!.id, req.user!.nome, id, {
        medicoNome: resultado.medico.nome, utentesMigrados: resultado.utentesMigrados, realocacoes,
      }, ip(req));
      return res.json({ mensagem: 'Médico inativado e auditoria registada.' });
    } catch (e: any) {
      const status = e.message.includes('Password') ? 401 : e.message.includes('não encontrado') ? 404 : 400;
      return res.status(status).json({ erro: e.message });
    }
  }

  getUtentesDeMedico(req: AuthRequest, res: Response) {
    try { return res.json(this.service.getUtentesDeMedico(Number(req.params.id))); }
    catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  realocarUtentes(req: AuthRequest, res: Response) {
    try {
      this.service.realocarUtentes(Number(req.params.id), Number(req.body.novoMedicoId));
      return res.json({ mensagem: 'Utentes realocados com sucesso.' });
    } catch (e: any) { return res.status(400).json({ erro: e.message }); }
  }
}

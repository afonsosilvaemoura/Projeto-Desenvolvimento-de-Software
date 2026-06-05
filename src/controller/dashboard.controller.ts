import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { DashboardService } from '../services/dashboard.service';
import { auditoriaService } from '../services/auditoria.service';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class DashboardController {
  private service = new DashboardService();

  getDashboardUtente(req: AuthRequest, res: Response) {
    try {
      const userId = Number(req.params.userId);
      if (req.user?.role === 'utente' && req.user.id !== userId)
        return res.status(403).json({ erro: 'Acesso negado.' });

      const dados = this.service.getDashboardUtente(userId);
      if (!dados) return res.status(404).json({ erro: 'Utente não encontrado.' });

      if (req.user?.role === 'medico' && dados.utente.medico_id !== req.user.id)
        return res.status(403).json({ erro: 'Acesso negado.' });

      return res.json(dados);
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getAlertasMedico(req: AuthRequest, res: Response) {
    try {
      return res.json(this.service.getAlertasMedico(req.user!.id));
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getDashboardMedico(req: AuthRequest, res: Response) {
    try {
      const medicoId = Number(req.params.medicoId);
      if (req.user?.id !== medicoId) return res.status(403).json({ erro: 'Acesso negado.' });
      return res.json(this.service.getDashboardMedico(medicoId));
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getEstatisticasAdmin(_req: AuthRequest, res: Response) {
    try {
      return res.json(new DashboardService().getEstatisticasAdmin());
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getDashboardAdmin(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.utenteId);
      if (req.user?.role === 'utente' && req.user.id !== id)
        return res.status(403).json({ erro: 'Acesso negado.' });

      const dados = this.service.getDashboardAdmin(id);
      if (!dados) return res.status(404).json({ erro: 'Utente não encontrado.' });

      if (req.user?.role === 'medico' && dados.utente.medico_id !== req.user.id)
        return res.status(403).json({ erro: 'Acesso negado: utente não está atribuído a este médico.' });

      if (req.user?.role !== 'utente') {
        auditoriaService.consultarDashboardUtente(
          req.user!.id, req.user!.nome, req.user!.role,
          id, dados.utente.nome, ip(req)
        );
      }

      return res.json(dados);
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }
}

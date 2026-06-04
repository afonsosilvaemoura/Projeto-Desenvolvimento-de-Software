import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AlertaService } from '../services/alerta.service';
import { auditoriaService } from '../services/auditoria.service';
import { UpdateEstadoAlertaDto } from '../dtos/alerta/alerta-response.dto';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class AlertaController {
  private service = new AlertaService();

  getAlertasMedico(req: AuthRequest, res: Response) {
    try {
      const alertas = this.service.getAlertasMedico(req.user!.id);
      auditoriaService.consultarAlertas(req.user!.id, req.user!.nome, alertas.length, ip(req));
      return res.json(alertas);
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  updateEstado(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body as UpdateEstadoAlertaDto;
      this.service.updateEstado(id, req.user!.id, estado);
      auditoriaService.atualizarEstadoAlerta(req.user!.id, req.user!.nome, id, estado, ip(req));
      return res.json({ mensagem: 'Estado do alerta atualizado.' });
    } catch (e: any) {
      const status = e.message.includes('não encontrado') ? 404
        : e.message.includes('inválido') ? 400 : 500;
      return res.status(status).json({ erro: e.message });
    }
  }

  getAllAlertas(_req: AuthRequest, res: Response) {
    try {
      return res.json(this.service.getAllAlertas());
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getLimiar(_req: AuthRequest, res: Response) {
    try {
      return res.json(this.service.getLimiar());
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  updateLimiar(req: AuthRequest, res: Response) {
    try {
      const { scoreMinimo, deterioracaoPontos } = req.body;
      const limiar = this.service.updateLimiar(Number(scoreMinimo), Number(deterioracaoPontos));
      return res.json({ mensagem: 'Limiar atualizado.', limiar });
    } catch (e: any) { return res.status(400).json({ erro: e.message }); }
  }
}

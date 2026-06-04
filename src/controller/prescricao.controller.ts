import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrescricaoService } from '../services/prescricao.service';
import { auditoriaService } from '../services/auditoria.service';
import { CreatePrescricaoDto } from '../dtos/prescricao/create-prescricao.dto';
import { db } from '../database/database';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class PrescricaoController {
  private service = new PrescricaoService();

  async listarComDTO(req: AuthRequest, res: Response) {
    try {
      let prescricoes;
      if (req.user?.role === 'utente')       prescricoes = this.service.listarPrescricoesComDTOParaUtente(req.user.id);
      else if (req.user?.role === 'medico')  prescricoes = this.service.listarPrescricoesParaMedico(req.user.id);
      else                                   prescricoes = this.service.listarPrescricoesComDTO();
      return res.json(prescricoes);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async criarComDTO(req: AuthRequest, res: Response) {
    try {
      const body = req.body as CreatePrescricaoDto;
      if (req.user?.role === 'medico') {
        const utente = db.prepare('SELECT medico_id FROM utente WHERE id = ?').get(Number(body.utente_id)) as any;
        if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
        if (utente.medico_id !== req.user.id) return res.status(403).json({ erro: 'Utente não está atribuído a este médico.' });
      }
      const nova = this.service.criarPrescricaoDTO(body) as any;

      auditoriaService.criarPrescricao(
        req.user!.id, req.user!.nome,
        Number(nova.id),
        Number(body.utente_id),
        body.farmaco,
        ip(req)
      );

      return res.status(201).json(nova);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

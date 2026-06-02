import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrescricaoService } from '../services/prescricao.service';

export class PrescricaoController {
  private service = new PrescricaoService();

  async listarComDTO(req: AuthRequest, res: Response) {
    try {
      const prescricoes = req.user?.role === 'utente'
        ? this.service.listarPrescricoesComDTOParaUtente(req.user.id)
        : this.service.listarPrescricoesComDTO();
      return res.json(prescricoes);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async criarComDTO(req: AuthRequest, res: Response) {
    try {
      const nova = this.service.criarPrescricaoDTO(req.body);
      return res.status(201).json(nova);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

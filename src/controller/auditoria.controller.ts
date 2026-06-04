import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { auditoriaService } from '../services/auditoria.service';

export class AuditoriaController {
  listar(req: AuthRequest, res: Response) {
    try {
      const limite = req.query.limite ? Number(req.query.limite) : 200;
      return res.json(auditoriaService.listar(limite));
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  exportar(_req: AuthRequest, res: Response) {
    try {
      const conteudo = auditoriaService.exportarTxt();
      const data = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="auditoria_${data}.txt"`);
      return res.send(conteudo);
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }
}

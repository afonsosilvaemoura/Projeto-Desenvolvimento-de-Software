import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RegistoService } from '../services/registo.service';
import { auditoriaService } from '../services/auditoria.service';
import { CreateUtenteDto } from '../dtos/utente/create-utente.dto';
import { CreateMedicoDto } from '../dtos/medico/create-medico.dto';

const ip = (req: any) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class RegistoController {
  private service = new RegistoService();

  listarUtentes(req: AuthRequest, res: Response) {
    try {
      const medicoId = req.user?.role === 'medico' ? req.user.id : undefined;
      return res.json(this.service.listarUtentes(medicoId));
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  getUtente(req: AuthRequest, res: Response) {
    try {
      const utente = this.service.getUtente(Number(req.params.id));
      if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
      return res.json(utente);
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  listarMedicos(_req: AuthRequest, res: Response) {
    try { return res.json(this.service.listarMedicos()); }
    catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  criarUtente(req: AuthRequest, res: Response) {
    try {
      const dados = req.body as CreateUtenteDto;
      const novo = this.service.criarUtente(dados);
      auditoriaService.criarUtente(req.user!.id, req.user!.nome, req.user!.role, novo.id, { nome: dados.nome, username: dados.username }, ip(req));
      return res.status(201).json({ mensagem: 'Utente criado com sucesso.', ...novo });
    } catch (e: any) { return res.status(e.message.includes('já existe') ? 409 : 400).json({ erro: e.message }); }
  }

  criarMedico(req: AuthRequest, res: Response) {
    try {
      const dados = req.body as CreateMedicoDto;
      const novo = this.service.criarMedico(dados);
      auditoriaService.criarMedico(req.user!.id, req.user!.nome, req.user!.role, novo.id, { nome: dados.nome, username: dados.username }, ip(req));
      return res.status(201).json({ mensagem: 'Médico criado com sucesso.', ...novo });
    } catch (e: any) { return res.status(e.message.includes('já existe') || e.message.includes('Cédula') ? 409 : 400).json({ erro: e.message }); }
  }

  getPerfil(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
      return res.json(this.service.getPerfil(req.user.id));
    } catch (e: any) { return res.status(500).json({ erro: e.message }); }
  }

  atualizarPerfil(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'utente') return res.status(403).json({ erro: 'Apenas utentes.' });
      const nome = this.service.atualizarPerfil(req.user.id, req.body);
      auditoriaService.atualizarPerfilUtente(req.user.id, nome, {}, ip(req));
      return res.json({ mensagem: 'Dados pessoais atualizados com sucesso.' });
    } catch (e: any) { return res.status(400).json({ erro: e.message }); }
  }
}

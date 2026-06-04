import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExameService } from '../services/exame.service';
import { db } from '../database/database';

export class ExameController {
    private service = new ExameService();

    async listar(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role === 'utente') return res.json(await this.service.listarExamesParaUtente(req.user.id));
            if (req.user?.role === 'medico') return res.json(await this.service.listarExamesParaMedico(req.user.id));
            return res.json(await this.service.listarExames());
        } catch (error: any) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async criar(req: AuthRequest, res: Response) {
        try {
            const { utente_id, tipo_exame, exame, medico_id, data_marcacao } = req.body;
            if (req.user?.role === 'medico') {
                const utente = db.prepare('SELECT medico_id FROM utente WHERE id = ?').get(Number(utente_id)) as any;
                if (!utente) return res.status(404).json({ erro: 'Utente não encontrado.' });
                if (utente.medico_id !== req.user.id) return res.status(403).json({ erro: 'Utente não está atribuído a este médico.' });
            }
            const novoExame = await this.service.criarExame({
                utente_id:    Number(utente_id ?? 0),
                tipo_exame,
                exame,
                medico_id:    medico_id ? Number(medico_id) : null,
                data_marcacao,
            });
            return res.status(201).json(novoExame);
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExameService } from '../services/exame.service';

export class ExameController {
    private service = new ExameService();

    async listar(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role === 'utente') {
                return res.json(await this.service.listarExamesParaUtente(req.user.id));
            }
            return res.json(await this.service.listarExames());
        } catch (error: any) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async criar(req: Request, res: Response) {
        try {
            const { utente_id, tipo_exame, exame, medico_id, data_marcacao } = req.body;
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
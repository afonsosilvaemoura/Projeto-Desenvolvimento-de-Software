import { Request, Response } from 'express';
import { ExameService } from '../services/exame.service';

export class ExameController {
    private service = new ExameService();

    async listar(req: Request, res: Response) {
        try {
            const exames = await this.service.listarExames();
            return res.json(exames);
        } catch (error: any) {
            return res.status(500).json({ erro: error.message });
        }
    }

    async criar(req: Request, res: Response) {
        try {
            const { utente_id, tipo_exame, exame, medico_nome, data_marcacao } = req.body;
            const novoExame = await this.service.criarExame({
                utente_id:     Number(utente_id ?? 0),
                tipo_exame,
                exame,
                medico_nome,
                data_marcacao,
            });
            return res.status(201).json(novoExame);
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
import { Request, Response } from 'express';
import { ExameService } from '../services/exame.service';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';

export class ExameController {
    private service = new ExameService();

    async listar(req: Request, res: Response) {
        const exames = await this.service.listarExames();
        return res.json(exames);
    }

    async listarComDTO(req: Request, res: Response) {
        const exames = await this.service.listarExamesComDTO();
        return res.json(exames);
    }

    // Versão sem DTOs: os dados são usados diretamente a partir do req.body
    async criar(req: Request, res: Response) {
        try {
            const { utente_id, tipo_exame, exame, medico_nome, data_marcacao } = req.body;
            const novoExame = await this.service.criarExame({
                utente_id,
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

    // Versão com DTOs: o formato esperado da entrada fica explícito
    async criarComDTO(req: Request, res: Response) {

        try {
            const dto: CreateExameDto = req.body;
            const novoExame = await this.service.criarExameDTO(dto);
            return res.status(201).json(novoExame);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }  
}
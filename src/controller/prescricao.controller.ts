import { Request, Response } from 'express';
import { PrescricaoService } from '../services/prescricao.service';
import { CreatePrescricaoDto } from '../dtos/prescricao/create-prescricao.dto';

export class PrescricaoController {
    private service = new PrescricaoService();

    async listar(req: Request, res: Response) {
        const prescricoes = await this.service.listarPrescricoes();
        return res.json(prescricoes);
    }

    async listarComDTO(req: Request, res: Response) {
        const prescricoes = await this.service.listarPrescricoesComDTO();
        return res.json(prescricoes);
    }

    async criar(req: Request, res: Response) {
        try {
            const { id, utente_id, medico_nome, farmaco, dosagem, posologia } = req.body;
            const novaPrescricao = await this.service.criarPrescricao({ id, utente_id, medico_nome, farmaco, dosagem, posologia });

            return res.status(201).json(novaPrescricao);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }

    // Versão com DTOs: o formato esperado da entrada fica explícito
    async criarComDTO(req: Request, res: Response) {

        try {
            const dto: CreatePrescricaoDto = req.body;
            const novaPrescricao = await this.service.criarPrescricaoDto(dto);
            return res.status(201).json(novaPrescricao);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }


    
    
}

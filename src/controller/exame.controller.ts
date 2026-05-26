/*    private service = new ExameService();

    async listar(req: Request, res: Response) {
        const exames = await this.service.listarExames();
        return res.json(exames);
    }

    async criar(req: Request, res: Response) {
        try {
            const { nome, codigo, medico_nome } = req.body;

            const novoExame = await this.service.criarExame({ nome, codigo, medico_nome });

            return res.status(201).json({
                mensagem: `Exame ${novoExame.nome} registado no sistema`,
                exame: novoExame
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
    */
import { Request, Response } from 'express';
import { ExameService } from '../services/exame.service';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';

export class ExameController {
    private service = new ExameService();
    
    async listar(req: Request, res: Response) {
        const exames = await this.service.listarExame();
        return res.json(exames);
    }

    async listarComDTO(req: Request, res: Response) {
        const exames = await this.service.listarExameComDTO();
        return res.json(exames);
    }

    async criar(req: Request, res: Response) {
        try {
            const { tipo_exame, exame, medico_nome, data_marcacao } = req.body;
            const novoExame = await this.service.criarExame({ tipo_exame, exame, medico_nome, data_marcacao });

            return res.status(201).json(novoExame);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }

    // Versão com DTOs: o formato esperado da entrada fica explícito
        async criarComDTO(req: Request, res: Response) {
    
            try {
                const dto: CreateExameDto = req.body;
                const novoExame = await this.service.criarExameDto(dto);
                return res.status(201).json(novoExame);
    
            } catch (error: any) {
                return res.status(400).json({ erro: error.message });
            }
        }
}
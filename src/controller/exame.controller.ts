import { Request, Response } from 'express';
import { baseDeDadosLocalExames } from '../database/database';
import { Exame } from '../models/exame.entity';
import { ExameService } from '../services/exame.service';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';

export class ExameController {
 
    async listar(req: Request, res: Response) {
        return res.json(baseDeDadosLocalExames);
    }

    async listarComDTO(req: Request, res: Response) {
        return res.json(baseDeDadosLocalExames.map(e => ({
            id: e.id,
            utente_id: e.utente_id,
            medico_nome: e.medico_nome,
            tipo: e.tipo,
            justificacao: e.justificacao,
            data_criacao: e.data_criacao,
            data_marcacao: e.data_marcacao
           
        })));

    }

    async criar(req: Request, res: Response) {
        try {
            const { utente_id, medico_nome, tipo, justificacao, data_criacao, data_marcacao } = req.body;
            const nova: Exame = {
                id: baseDeDadosLocalExames.length + 1,
                utente_id,
                medico_nome,
                tipo,
                justificacao,
                data_criacao: new Date().toISOString(),
                data_marcacao: new Date().toISOString()
            };

            baseDeDadosLocalExames.push(nova);

            return res.status(201).json(nova);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }

    /*
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
            */
}



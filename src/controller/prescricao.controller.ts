import { Request, Response } from 'express';
import { CreatePrescricaoDto } from '../dtos/prescricao/create-prescricao.dto';
import { baseDeDadosLocalPrescricao } from '../database/database';
import { PrescricaoService } from '../services/prescricao.service';
import { Prescricao } from '../models/prescricao.entity';
export class PrescricaoController {

        async listar(req: Request, res: Response) {
        // Retorna tudo o que está na nossa lista
        return res.json(baseDeDadosLocalPrescricao);
    }

    async listarComDTO(req: Request, res: Response) {
        return res.json(baseDeDadosLocalPrescricao.map(p => ({
            id: p.id,
            utente_id: p.utente_id,
            medico_nome: p.medico_nome,
            farmaco: p.farmaco,
            dosagem: p.dosagem,
            posologia: p.posologia,
            data_criacao: p.data_criacao
        })));
    }

        async criar(req: Request, res: Response) {
        const { id, medico_nome, utente_id, farmaco, dosagem, posologia } = req.body;

        // Criamos o objeto manualmente
        const nova: Prescricao = {
            id: baseDeDadosLocalPrescricao.length + 1,
            utente_id,
            medico_nome,
            farmaco,
            dosagem,
            posologia,
            data_criacao: new Date().toISOString()  
        };

        // Guardamos na nossa lista "global"
        baseDeDadosLocalPrescricao.push(nova);

        return res.status(201).json(nova);
    }

/*
    // Versão com DTOs: o formato esperado da entrada fica explícito
    async criarComDTO(req: Request, res: Response) {

        try {
            const dto: CreatePrescricaoDto = req.body;
            const nova = await this.service.criarPrescricaoDto(dto);
            baseDeDadosLocal.push(nova);
            return res.status(201).json(nova);

        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    } 
        
*/
}

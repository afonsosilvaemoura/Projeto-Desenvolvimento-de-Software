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
import { ExamesService } from '../services/exame.service';

const service = new ExamesService();

export class ExameController {

    async listar(req: Request, res: Response) {
        try {
            const exames = await service.listarExames();
            return res.status(200).json(exames);

        } catch (erro: any) {
            return res.status(500).json({
                erro: erro.message || 'Erro ao listar exames'
            });
        }
    }

    async criar(req: Request, res: Response) {
        try {
            const resultado = await service.criarExame(req.body);

            return res.status(201).json({
                mensagem: 'Exame marcado com sucesso!',
                dados: resultado
            });

        } catch (erro: any) {
            return res.status(400).json({
                erro: erro.message || 'Erro ao marcar exame'
            });
        }
    }
}
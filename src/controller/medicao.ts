import { Request, Response } from 'express';
import { MedicacaoService } from '../services/medicacao.service';

export class MedicacaoController {
    private service = new MedicacaoService();

    async listar(req: Request, res: Response) {
        const medicacoes = await this.service.listarMedicacoes();
        return res.json(medicacoes);
    }

    async criar(req: Request, res: Response) {
        try {
            const { nome, codigo, medico_nome } = req.body;

            const novaMedicacao = await this.service.criarMedicacao({ nome, codigo, medico_nome });

            return res.status(201).json({
                mensagem: `Medicação ${novaMedicacao.nome} registada no sistema`,
                medicacao: novaMedicacao
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
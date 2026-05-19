import { Request, Response } from 'express';
import { CaratService } from '../services/carat.service';

export class CaratController {
    private service = new CaratService();

    async listar(req: Request, res: Response) {
        const carat = await this.service.listarCarat();
        return res.json(carat);
    }

    async criar(req: Request, res: Response) {
        try {
            const { codigo, perguntas } = req.body;

            const novoCarat = await this.service.criarCarat({ codigo, perguntas });

            return res.status(201).json({
                mensagem: `Carat ${novoCarat.codigo} registado no sistema`,
                carat: novoCarat
            });
        } catch (error: any) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
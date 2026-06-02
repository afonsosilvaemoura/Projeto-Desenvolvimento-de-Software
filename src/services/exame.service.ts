import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';

interface CreateExameDto {
    utente_id: number;
    tipo_exame: string;
    exame: string;
    medico_id?: number | null;
    data_marcacao: string;
}

export class ExameService {
    private repo = AppDataSource.getRepository(Exame);

    async criarExame(dados: CreateExameDto): Promise<Exame> {
        const novo = this.repo.create({
            utente_id:     dados.utente_id,
            tipo_exame:    dados.tipo_exame,
            exame:         dados.exame,
            medico_id:     dados.medico_id ?? null,
            data_marcacao: new Date(dados.data_marcacao),
            data_criacao:  new Date(),
        });
        return this.repo.save(novo);
    }

    async listarExames(): Promise<Exame[]> {
        return this.repo.find();
    }

    async listarExamesParaUtente(utenteId: number): Promise<Exame[]> {
        return this.repo.find({ where: { utente_id: utenteId } });
    }
}
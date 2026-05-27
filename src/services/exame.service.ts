import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';

export class ExameService {
    
    private repo = AppDataSource.getRepository(Exame);

    async criarExame(
        dados: { utente_id: number; tipo: string; medico_nome: string; justificacao: string; data_marcacao: Date }
    ): Promise<Exame> {
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            tipo: dados.tipo,
            medico_nome: dados.medico_nome,
            data_marcacao: dados.data_marcacao, 
        });

        if (jaExiste) {
            throw new Error('Já existe um exame com os mesmos dados registado no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });
         
        return this.repo.save(nova);
    }

    async criarExameDTO(
        dados: CreateExameDto
    ): Promise<ExameResponseDto> {
const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            tipo: dados.tipo,
            medico_nome: dados.medico_nome,
            data_marcacao: new Date(dados.data_marcacao),
        });

        if (jaExiste) {
            throw new Error('Já existe um exame com os mesmos dados registado no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });

        const guardada = await this.repo.save(nova);
        return this.criarExameDTO(guardada);
    }

    async listarExame(): Promise<Exame[]> {
        return this.repo.find();
    }

    async listarExameComDTO(): Promise<ExameResponseDto[]> {
        const exames = await this.repo.find();
        return exames.map((exame) => this.toResponseDto(exame));
    }

    async listarComFiltro(nomeMedico: string): Promise<ExameResponseDto[]> {
        const exames = await this.repo.find({
            where: { medico_nome: nomeMedico },
        });
        return exames.map((exame) => this.toResponseDto(exame));
    }

    private toResponseDto(exame: Exame): ExameResponseDto {
        return {
            id: exame.id,
            utente_id: exame.utente_id,
            medico_nome: exame.medico_nome,
            tipo: exame.tipo,
            justificacao: exame.justificacao,
            data_marcacao: exame.data_marcacao,
            data_criacao: exame.data_criacao
        };
    }
}
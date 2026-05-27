import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';

export class ExameService {

    private repo = AppDataSource.getRepository(Exame);

    async criarExame(
        dados: { utente_id: number; tipo_exame: string; exame: string; medico_nome: string; data_marcacao: Date }
    ): Promise<Exame> {
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            tipo_exame: dados.tipo_exame,
            exame: dados.exame,
            medico_nome: dados.medico_nome,
            data_marcacao: dados.data_marcacao,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição com os mesmos dados registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });
         
        return this.repo.save(nova);
    }

    async criarExameDTO(
        dados: CreateExameDto
    ): Promise<Exame> {
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            tipo_exame: dados.tipo_exame,
            exame: dados.exame,
            medico_nome: dados.medico_nome,
            data_marcacao: dados.data_marcacao,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição com os mesmos dados registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });

        const guardada = await this.repo.save(nova);
        return this.criarExameDTO(guardada);
    }

      async listarExames(): Promise<Exame[]> {
        return this.repo.find();
    }

    async listarExamesComDTO(): Promise<ExameResponseDto[]> {
        const exames = await this.repo.find();
        return exames.map((exame) => this.toResponseDto(exame));
    }

/*

    async listarComFiltro(nomeMedico: string): Promise<ExameResponseDto[]> {
        const exames = await this.repo.find({
            where: { medico_nome: nomeMedico },
        });
        
        return exames.map((exame) => this.toResponseDto(exame));
    }
*/

    private toResponseDto(exame: Exame): ExameResponseDto {
        return {
            utente_id: exame.utente_id,
            tipo_exame: exame.tipo_exame,
            exame: exame.exame,
            medico_nome: exame.medico_nome,
            data_marcacao: exame.data_marcacao,
            data_criacao: exame.data_criacao,
        };
    }
}
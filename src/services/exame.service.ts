import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';

export class ExameService {

    private repo = AppDataSource.getRepository(Exame);



    async criarExame(
        dados: { nome: string; codigo: string; medico_nome: string }
    ): Promise<Exame> {
        const jaExiste = await this.repo.findOneBy({
            nome: dados.nome,
            codigo: dados.codigo,
            medico_nome: dados.medico_nome,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição igual registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados, // espalha os campos medicamento, dose e medico_nome
            dataCriacao: new Date(),
        });

        return this.repo.save(nova);
    }


    async criarExameComDTO(
        dados: CreateExameDto
    ): Promise<ExameResponseDto> {
        const jaExiste = await this.repo.findOneBy({
            tipo_exame: dados.tipo_exame,
            exame: dados.exame,
            medico_nome: dados.medico_nome,
        });

        if (jaExiste) {
            throw new Error('Já existe um exame igual registado no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            dataCriacao: new Date(),
        });

        const guardada = await this.repo.save(nova);
        return this.toResponseDto(guardada);
    }


    async listarExames(): Promise<Exame[]> {
        return this.repo.find();
    }

    async listarExamesComDTO(): Promise<ExameResponseDto[]> {
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
            tipo_exame: exame.tipo_exame,
            exame: exame.exame,
            medico_nome: exame.medico_nome,
        };
    }


}
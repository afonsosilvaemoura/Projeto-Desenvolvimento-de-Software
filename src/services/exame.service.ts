import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';

export class ExamesService {
    private repo = AppDataSource.getRepository(Exame);

    async criarExame(dados: CreateExameDto): Promise<Exame> {
        // 1. Verificação de duplicidade: ignore o ID aqui
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            tipo: dados.tipo,
            medico_nome: dados.medico_nome,
            data_marcacao: dados.data_marcacao as any, 
        });

        if (jaExiste) {
            throw new Error('Já existe um exame igual registado no sistema.');
        }

        // 2. Desestruture para remover o ID (se vier no DTO) e garantir a consistência
        const { id, ...dadosSemId } = dados;

        const nova = this.repo.create({
            ...dadosSemId,
            // Certifique-se de que o nome aqui é igual ao da sua Entidade
            data_criacao: new Date(), 
        });

        return this.repo.save(nova);
    }

    async criarPrescricaoComDTO(dados: CreateExameDto): Promise<ExameResponseDto> {
        // Reutilizamos a lógica de criação para evitar duplicação
        const exameCriado = await this.criarExame(dados);
        return this.toResponseDto(exameCriado);
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
            data_criacao: exame.data_criacao,
        };
    }
}
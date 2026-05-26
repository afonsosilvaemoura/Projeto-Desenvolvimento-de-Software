import { AppDataSource } from '../database/database';
import { Prescricao } from '../models/prescricao.entity';
import { CreatePrescricaoDto } from '../dtos/prescricao/create-prescricao.dto';
import { PrescricaoResponseDto } from '../dtos/prescricao/prescricao-response.dto';

export class PrescricaoService {

    private repo = AppDataSource.getRepository(Prescricao);

    async criarPrescricao(
        dados: { id: number; utente_id: number; medico_nome: string; farmaco: string; dosagem: string; posologia: string }
    ): Promise<Prescricao> {
        const jaExiste = await this.repo.findOneBy({
            id: dados.id,
            utente_id: dados.utente_id,
            medico_nome: dados.medico_nome,
            farmaco: dados.farmaco,
            dosagem: dados.dosagem,
            posologia: dados.posologia,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição igual registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados, // espalha os campos medicamento, dose e medico_nome
            data_criacao: new Date(),
        });

        return this.repo.save(nova);
    }


    async criarPrescricaoDto(
        dados: CreatePrescricaoDto
    ): Promise<PrescricaoResponseDto> {
        const jaExiste = await this.repo.findOneBy({
            id: dados.id,
            utente_id: dados.utente_id,
            medico_nome: dados.medico_nome,
            farmaco: dados.farmaco,
            dosagem: dados.dosagem,
            posologia: dados.posologia,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição igual registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });

        const guardada = await this.repo.save(nova);
        return this.toResponseDto(guardada);
    }

    // Busca todas as prescrições
    async listarPrescricoes(): Promise<Prescricao[]> {
        return this.repo.find();
    }

    // Busca com transformação em DTO (sem expor a data de criação)
    async listarPrescricoesComDTO(): Promise<PrescricaoResponseDto[]> {
        const prescricoes = await this.repo.find();
        return prescricoes.map((prescricao) => this.toResponseDto(prescricao));
    }

    // Busca por filtro (médico específico)
    async listarComFiltro(nomeMedico: string): Promise<PrescricaoResponseDto[]> {
        const prescricoes = await this.repo.find({
            where: { medico_nome: nomeMedico },
        });
        return prescricoes.map((prescricao) => this.toResponseDto(prescricao));
    }

    // Usando DTO, podemos controlar os campos devolvidos ao cliente.
    // Aqui, por exemplo, a dataCriacao existe na entidade Prescricao, mas não é enviada na resposta.

    // Este método pode ainda ser transformado num DTO assembler, caso a lógica de transformação seja mais complexa ou reutilizada em vários pontos do código.

    private toResponseDto(prescricao: Prescricao): PrescricaoResponseDto {
        return {
            id: prescricao.id,
            medicamento: prescricao.farmaco,
            dose: prescricao.dosagem,
            medico_nome: prescricao.medico_nome,
        };
    }
}
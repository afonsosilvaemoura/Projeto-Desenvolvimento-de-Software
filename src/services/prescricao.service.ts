import { AppDataSource } from '../database/database';
import { Prescricao } from '../models/prescricao.entity';
import { CreatePrescricaoDto } from '../dtos/prescricao/create-prescricao.dto';
import { PrescricaoResponseDto } from '../dtos/prescricao/prescricao-response.dto';

export class PrescricaoService {

    private repo = AppDataSource.getRepository(Prescricao);

    async criarPrescricao(
        dados: { utente_id: number; farmaco: string; dosagem: string; medico_nome: string; posologia: string }
    ): Promise<Prescricao> {
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            farmaco: dados.farmaco,
            dosagem: dados.dosagem,
            medico_nome: dados.medico_nome,
            posologia: dados.posologia,
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

    async criarPrescricaoDTO(
        dados: CreatePrescricaoDto
    ): Promise<Prescricao> {
        const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            farmaco: dados.farmaco,
            dosagem: dados.dosagem,
            medico_nome: dados.medico_nome,
            posologia: dados.posologia,
        });

        if (jaExiste) {
            throw new Error('Já existe uma prescrição com os mesmos dados registada no sistema.');
        }

        const nova = this.repo.create({
            ...dados,
            data_criacao: new Date(),
        });

        const guardada = await this.repo.save(nova);
        return this.criarPrescricaoDTO(guardada);
    }

      async listarPrescricoes(): Promise<Prescricao[]> {
        return this.repo.find();
    }

    async listarPrescricoesComDTO(): Promise<PrescricaoResponseDto[]> {
        const prescricoes = await this.repo.find();
        return prescricoes.map((prescricao) => this.toResponseDto(prescricao));
    }

/*

    async listarComFiltro(nomeMedico: string): Promise<PrescricaoResponseDto[]> {
        const prescricoes = await this.repo.find({
            where: { medico_nome: nomeMedico },
        });
        
        return prescricoes.map((prescricao) => this.toResponseDto(prescricao));
    }
*/

    private toResponseDto(prescricao: Prescricao): PrescricaoResponseDto {
        return {
            id: prescricao.id,
            utente_id: prescricao.utente_id,
            farmaco: prescricao.farmaco,
            dosagem: prescricao.dosagem,
            medico_nome: prescricao.medico_nome,
            posologia: prescricao.posologia,
            data_criacao: prescricao.data_criacao,
        };
    }
}
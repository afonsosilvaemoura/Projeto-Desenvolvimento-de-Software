/*
import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';

export class ExameService {

    private repo = AppDataSource.getRepository(Exame);

    async criarExame(dados: { tipo_exame: string, exame: string, medico_nome: string }): Promise<Exame> {

        if (dados.exame.length !== 4) {
            throw new Error("O código do exame deve ter exatamente 4 caracteres.");
        }

        const jaExiste = await this.repo.findOneBy({
            tipo_exame: dados.tipo_exame,
            exame: dados.exame,
            medico_nome: dados.medico_nome,
        });
        if (jaExiste) {
            throw new Error("Já existe um exame igual registado no sistema.");
        }

        const novo = this.repo.create(dados);
        return this.repo.save(novo);
    }

    async listarExames(): Promise<Exame[]> {
        return this.repo.find();
    }
}
*/

import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';
export class ExamesService {

    private repo = AppDataSource.getRepository(Exame);

       async criarExame(
            dados: { tipo_exame: string; exame: string; medico_nome: string; data_marcacao: string | Date }
        ): Promise<Exame> {
            const jaExiste = await this.repo.findOneBy({
                tipo_exame: dados.tipo_exame,
                exame: dados.exame,
                medico_nome: dados.medico_nome,
            });
    
            if (jaExiste) {
                throw new Error('Já existe um exame igual registado no sistema.');
            }
    
            const nova = this.repo.create({
                ...dados, // espalha os campos tipo_exame, exame e medico_nome
                dataCriacao: new Date(),
            });
    
            return this.repo.save(nova);
        }

 async criarPrescricaoComDTO(
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

    async listarExamecomDTO(): Promise<Exame[]> {
            return this.repo.find();
        }
    
        // Busca com transformação em DTO (sem expor a data de criação)
        async listarExameComDTO(): Promise<ExameResponseDto[]> {
            const exames = await this.repo.find();
            return exames.map((exame) => this.toResponseDto(exame));
        }
    
        // Busca por filtro (médico específico)
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

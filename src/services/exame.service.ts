import { AppDataSource } from '../database/database';
import { Exame } from '../models/exame.entity';
import { CreateExameDto } from '../dtos/exame/create-exame.dto';
import { ExameResponseDto } from '../dtos/exame/exame-response.dto';
export class ExameService {

    private repo = AppDataSource.getRepository(Exame);

       async criarExame(
            dados: { id: number;utente_id: number; medico_nome: string; tipo: string; justificacao: string; data_criacao: Date; data_marcacao: Date }
        ): Promise<Exame> {
            const jaExiste = await this.repo.findOneBy({
                id: dados.id,
                utente_id: dados.utente_id,
                medico_nome: dados.medico_nome,
                tipo: dados.tipo,
                justificacao: dados.justificacao,
                data_criacao: dados.data_criacao,
                data_marcacao: dados.data_marcacao,
            })  
    
            if (jaExiste) {
                throw new Error('Já existe um exame igual registado no sistema.');
            }
    
            const nova = this.repo.create({
                ...dados, // espalha os campos tipo_exame, exame e medico_nome
                data_criacao: new Date(),
            });
    
            return this.repo.save(nova);
        }

 async criarExameDto(
         dados: CreateExameDto
     ): Promise<ExameResponseDto> {
         const jaExiste = await this.repo.findOneBy({
            utente_id: dados.utente_id,
            medico_nome: dados.medico_nome,
            tipo: dados.tipo,
            justificacao: dados.justificacao,
            data_marcacao: dados.data_marcacao,
         });
 
         if (jaExiste) {
             throw new Error('Já existe um exame igual registado no sistema.');
         }
 
         const nova = this.repo.create({
             ...dados,
             data_criacao: new Date(),
         });
 
         const guardada = await this.repo.save(nova);
         return this.toResponseDto(guardada);
     }

    async listarExame(): Promise<Exame[]> {
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
                utente_id: exame.utente_id,
                medico_nome: exame.medico_nome,
                tipo: exame.tipo,
                justificacao: exame.justificacao,
                data_marcacao: exame.data_marcacao,
            };
        }
    }

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

import { AppDataSource } from '../data-source';
import { Exame } from '../entity/Exame';

export class ExamesService {

    private repository = AppDataSource.getRepository(Exame);

    async listarExames() {
        return await this.repository.find();
    }

    async criarExame(data: {
        tipo_exame: string;
        exame: string;
        medico_nome: string;
        dataMarcacao: string | Date;
    }) {

        const { tipo_exame, exame, medico_nome, dataMarcacao } = data;

        if (!tipo_exame || !exame || !medico_nome || !dataMarcacao) {
            throw new Error('Campos obrigatórios em falta');
        }

        const novoExame = this.repository.create({
            tipo_exame,
            exame,
            medico_nome,
            dataMarcacao: new Date(dataMarcacao),
            dataCriacao: new Date()
        });

        return await this.repository.save(novoExame);
    }
}
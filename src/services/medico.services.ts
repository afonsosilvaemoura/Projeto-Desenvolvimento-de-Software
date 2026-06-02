import { AppDataSource } from '../database/database';
import { Medico } from '../models/medico.entity';
import bcrypt from 'bcryptjs';

export class MedicoService {
  
  async criarMedico(dados: {
    nome: string;
    username: string;
    email?: string;
    password: string;
    especialidade: string;
    numero_cedula?: string;
  }): Promise<Medico> {
    const repo = AppDataSource.getRepository(Medico);

    // Verificar se username já existe
    const existe = await repo.findOne({ where: { username: dados.username } });
    if (existe) throw new Error('Username já existe.');

    // Criar médico
    const medico = repo.create({
      nome: dados.nome,
      username: dados.username,
      email: dados.email || null,
      password_hash: bcrypt.hashSync(dados.password, 10),
      especialidade: dados.especialidade,
      numero_cedula: dados.numero_cedula || null,
      ativo: true,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    });

    return repo.save(medico);
  }

  async definirAtivo(id: number, ativo: boolean, motivo?: string): Promise<void> {
    const repo = AppDataSource.getRepository(Medico);
    const medico = await repo.findOne({ where: { id } });
    if (!medico) throw new Error('Médico não encontrado.');

    medico.ativo = ativo;
    if (!ativo && motivo) (medico as any).motivo_inativacao = motivo;
    medico.dataAtualizacao = new Date();

    await repo.save(medico);
  }

  async listarMedicos(): Promise<Medico[]> {
    return AppDataSource.getRepository(Medico).find({ order: { nome: 'ASC' } });
  }

  async obterMedico(id: number): Promise<Medico | null> {
    return AppDataSource.getRepository(Medico).findOne({ where: { id } });
  }
}

export const medicoService = new MedicoService();

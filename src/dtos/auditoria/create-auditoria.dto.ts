import { AppDataSource } from "../database/database";
import type { CreateAuditoriaDTO } from "../dtos/auditoria/create-auditoria.dto";

export class AuditoriaService {
  private repo = AppDataSource.from("auditoria");

  async registar(dto: CreateAuditoriaDTO): Promise<void> {
    await this.repo.insert({
      ator_user_id: dto.ator_user_id,
      ator_role: dto.ator_role,
      acao: dto.acao,
      entidade: dto.entidade,
      entidade_id: dto.entidade_id,
      detalhes: (dto.detalhes ?? {}) as never,
    });
  }
}

export const auditoriaService = new AuditoriaService();
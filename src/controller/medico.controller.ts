/**
 * MedicoController — análogo ao UtenteController.
 */
import { assertAdmin } from "../middleware/auth.middleware";
import { medicoService } from "../services/medico.services";
import { auditoriaService } from "../services/auditoria.services";
import type { CreateMedicoDto } from "../dtos/medico/create-medico.dto";

export class MedicoController {
  private service = medicoService;

  async criar(actorId: string, dto: CreateMedicoDto) {
    await assertAdmin(actorId);
    const novo = await this.service.criarMedico(dto);
    await auditoriaService.registar({
      ator_user_id: actorId, ator_role: "administrador",
      acao: "CRIAR", entidade: "medico", entidade_id: novo.user_id,
      detalhes: { email: dto.email },
    });
    return { ok: true as const, mensagem: `Médico ${dto.nome} registado.`, medico: novo };
  }

  async toggleAtivo(actorId: string, userId: string, ativo: boolean) {
    await assertAdmin(actorId);
    await this.service.definirAtivo(userId, ativo);
    await auditoriaService.registar({
      ator_user_id: actorId, ator_role: "administrador",
      acao: ativo ? "ATIVAR" : "DESATIVAR", entidade: "medico",
      entidade_id: userId, detalhes: {},
    });
    return { ok: true as const };
  }

  async listar() {
    return await this.service.listarMedicos();
  }
}

export const medicoController = new MedicoController();


import { AppDataSource } from "../database/database";
import type { CreateMedicoDto } from "../dtos/medico/create-medico.dto";
import type { MedicoResponseDTO } from "../dtos/medico/medico-response.dto";

export class MedicoService {
  private repo = AppDataSource.from("medicos");

  async criarMedico(dados: CreateMedicoDto): Promise<MedicoResponseDTO> {
    const { data: created, error: authErr } = await AppDataSource.auth.admin.createUser({
      email: dados.email,
      password: dados.password,
      email_confirm: true,
      user_metadata: { nome: dados.nome },
    });
    if (authErr || !created.user) {
      throw new Error(authErr?.message ?? "Falha ao criar utilizador.");
    }
    const uid = created.user.id;

    await AppDataSource.from("profiles").upsert({
      id: uid,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone ?? null,
    });
    await AppDataSource
      .from("user_roles")
      .upsert({ user_id: uid, role: "medico" }, { onConflict: "user_id,role" });

    const { error: mErr } = await this.repo.insert({
      user_id: uid,
      especialidade: dados.especialidade,
      cedula_profissional: dados.cedula_profissional,
    });
    if (mErr) throw new Error(mErr.message);

    return { user_id: uid, especialidade: dados.especialidade, ativo: true };
  }

  async definirAtivo(userId: string, ativo: boolean): Promise<void> {
    const { error } = await this.repo.update({ ativo }).eq("user_id", userId);
    if (error) throw new Error(error.message);
  }

  async listarMedicos() {
    const { data, error } = await this.repo.select("*");
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}

export const medicoService = new MedicoService();

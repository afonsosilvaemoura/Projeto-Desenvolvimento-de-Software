import { db } from '../database/database';

export type AcaoAuditoria =
  | 'LOGIN_SUCESSO'           | 'LOGIN_FALHA'
  | 'CRIAR_UTENTE'            | 'CRIAR_MEDICO'
  | 'ATUALIZAR_PERFIL_UTENTE'
  | 'INATIVAR_UTENTE'         | 'ATIVAR_UTENTE'
  | 'INATIVAR_MEDICO'         | 'ATIVAR_MEDICO'   | 'DESATIVAR_MEDICO'
  | 'CONSULTAR_DASHBOARD_UTENTE'
  | 'RESPOSTA_CARAT_UTENTE'   | 'RESPOSTA_CARAT_MEDICO'
  | 'CRIAR_PRESCRICAO'
  | 'INATIVAR_PRESCRICAO'     | 'ATIVAR_PRESCRICAO'
  | 'CRIAR_EXAME'
  | 'CONSULTAR_ALERTAS'
  | 'ATUALIZAR_ESTADO_ALERTA'
  | 'REALOCACAO_UTENTE_MEDICO';

interface RegistarParams {
  acao: AcaoAuditoria | string;
  entidade: string;
  entidade_id?: number | null;
  utilizador_id?: number | null;
  utilizador_nome?: string;
  utilizador_role?: string;
  detalhes?: Record<string, unknown>;
  ip?: string;
  sucesso?: boolean;
}

const stmt = () => db.prepare(`
  INSERT INTO auditoria
    (admin_id, admin_nome, acao, entidade, entidade_id, detalhes,
     utilizador_role, ip_address, sucesso, dataCriacao)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export class AuditoriaService {

  registar(p: RegistarParams): void {
    try {
      stmt().run(
        p.utilizador_id   ?? 0,
        p.utilizador_nome ?? 'Anónimo',
        p.acao,
        p.entidade,
        p.entidade_id     ?? null,
        p.detalhes ? JSON.stringify(p.detalhes) : null,
        p.utilizador_role ?? null,
        p.ip              ?? null,
        (p.sucesso ?? true) ? 1 : 0,
        new Date().toISOString()
      );
    } catch (e) {
      console.error('[Auditoria] Erro ao registar:', e);
    }
  }

  loginSucesso(id: number, nome: string, role: string, ip?: string): void {
    this.registar({
      acao: 'LOGIN_SUCESSO', entidade: 'sessao', entidade_id: id,
      utilizador_id: id, utilizador_nome: nome, utilizador_role: role,
      detalhes: { nome, role }, ip, sucesso: true,
    });
  }

  loginFalha(username: string, motivo: string, ip?: string): void {
    this.registar({
      acao: 'LOGIN_FALHA', entidade: 'sessao',
      utilizador_nome: username,
      detalhes: { username, motivo }, ip, sucesso: false,
    });
  }

  criarUtente(atorId: number, atorNome: string, atorRole: string, novoId: number, dados: Record<string, unknown>, ip?: string): void {
    this.registar({
      acao: 'CRIAR_UTENTE', entidade: 'utente', entidade_id: novoId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: atorRole,
      detalhes: dados, ip,
    });
  }

  criarMedico(atorId: number, atorNome: string, atorRole: string, novoId: number, dados: Record<string, unknown>, ip?: string): void {
    this.registar({
      acao: 'CRIAR_MEDICO', entidade: 'medico', entidade_id: novoId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: atorRole,
      detalhes: dados, ip,
    });
  }

  atualizarPerfilUtente(id: number, nome: string, _campos: Record<string, unknown>, ip?: string): void {
    this.registar({
      acao: 'ATUALIZAR_PERFIL_UTENTE', entidade: 'utente', entidade_id: id,
      utilizador_id: id, utilizador_nome: nome, utilizador_role: 'utente',
      ip,
    });
  }

  inativarUtente(atorId: number, atorNome: string, utenteId: number, motivo: string, ip?: string): void {
    this.registar({
      acao: 'INATIVAR_UTENTE', entidade: 'utente', entidade_id: utenteId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: 'administrador',
      detalhes: { motivo }, ip,
    });
  }

  ativarUtente(atorId: number, atorNome: string, utenteId: number, ip?: string): void {
    this.registar({
      acao: 'ATIVAR_UTENTE', entidade: 'utente', entidade_id: utenteId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: 'administrador',
      ip,
    });
  }

  ativarMedico(atorId: number, atorNome: string, medicoId: number, ip?: string): void {
    this.registar({
      acao: 'ATIVAR_MEDICO', entidade: 'medico', entidade_id: medicoId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: 'administrador',
      ip,
    });
  }

  respostaCarat(atorId: number, atorNome: string, role: string, targetUtenteId: number, avaliacaoId: number, ip?: string): void {
    const acao: AcaoAuditoria = role === 'medico' ? 'RESPOSTA_CARAT_MEDICO' : 'RESPOSTA_CARAT_UTENTE';
    this.registar({
      acao, entidade: 'avaliacao_carat', entidade_id: avaliacaoId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: role,
      detalhes: { utente_id: targetUtenteId }, ip,
    });
  }

  criarPrescricao(medicoId: number, medicoNome: string, prescricaoId: number, utenteId: number, farmaco: string, ip?: string): void {
    this.registar({
      acao: 'CRIAR_PRESCRICAO', entidade: 'prescricao', entidade_id: prescricaoId,
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: 'medico',
      detalhes: { utenteId, farmaco }, ip,
    });
  }

  togglePrescricao(medicoId: number, medicoNome: string, prescricaoId: number, ativo: boolean, ip?: string): void {
    this.registar({
      acao: ativo ? 'ATIVAR_PRESCRICAO' : 'INATIVAR_PRESCRICAO',
      entidade: 'prescricao', entidade_id: prescricaoId,
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: 'medico',
      ip,
    });
  }

  criarExame(medicoId: number, medicoNome: string, exameId: number, utenteId: number, tipo: string, ip?: string): void {
    this.registar({
      acao: 'CRIAR_EXAME', entidade: 'exame', entidade_id: exameId,
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: 'medico',
      detalhes: { utenteId, tipo }, ip,
    });
  }

  consultarAlertas(medicoId: number, medicoNome: string, total: number, ip?: string): void {
    this.registar({
      acao: 'CONSULTAR_ALERTAS', entidade: 'alerta',
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: 'medico',
      detalhes: { totalAlertas: total }, ip,
    });
  }

  atualizarEstadoAlerta(medicoId: number, medicoNome: string, alertaId: number, estado: string, ip?: string): void {
    this.registar({
      acao: 'ATUALIZAR_ESTADO_ALERTA', entidade: 'alerta', entidade_id: alertaId,
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: 'medico',
      detalhes: { novoEstado: estado }, ip,
    });
  }

  realocacaoUtente(adminId: number, adminNome: string, utenteId: number, novoMedicoId: number, ip?: string): void {
    this.registar({
      acao: 'REALOCACAO_UTENTE_MEDICO', entidade: 'utente', entidade_id: utenteId,
      utilizador_id: adminId, utilizador_nome: adminNome, utilizador_role: 'administrador',
      detalhes: { novoMedicoId }, ip,
    });
  }

  consultarDashboardUtente(medicoId: number, medicoNome: string, medicoRole: string, utenteId: number, utenteNome: string, ip?: string): void {
    this.registar({
      acao: 'CONSULTAR_DASHBOARD_UTENTE', entidade: 'utente', entidade_id: utenteId,
      utilizador_id: medicoId, utilizador_nome: medicoNome, utilizador_role: medicoRole,
      detalhes: { utenteNome }, ip,
    });
  }

  inativarMedico(atorId: number, atorNome: string, medicoId: number, detalhes: Record<string, unknown>, ip?: string): void {
    this.registar({
      acao: 'INATIVAR_MEDICO', entidade: 'medico', entidade_id: medicoId,
      utilizador_id: atorId, utilizador_nome: atorNome, utilizador_role: 'administrador',
      detalhes, ip,
    });
  }

  listar(limite = 200) {
    return db.prepare(`
      SELECT id, admin_id as utilizador_id, admin_nome as utilizador_nome,
             utilizador_role, acao, entidade, entidade_id, detalhes,
             ip_address, sucesso, dataCriacao
      FROM auditoria
      ORDER BY dataCriacao DESC
      LIMIT ?
    `).all(limite) as any[];
  }

  exportarTxt(): string {
    const registos = this.listar(100000);
    const sep = '─'.repeat(110);
    const header = [
      'REGISTO DE AUDITORIA — SAUDINOB',
      `Exportado em: ${new Date().toLocaleString('pt-PT')}`,
      `Total de registos: ${registos.length}`,
      sep,
      '',
    ].join('\n');

    const linhas = registos.map(r => {
      const data   = r.dataCriacao ? new Date(r.dataCriacao).toLocaleString('pt-PT') : '—';
      const estado = r.sucesso ? 'OK   ' : 'FALHA';
      const ator   = `${r.utilizador_nome ?? 'Anónimo'} (${r.utilizador_role ?? '—'})`;
      const alvo   = `${r.entidade ?? '—'} #${r.entidade_id ?? '—'}`;
      let det = '';
      try { if (r.detalhes) det = JSON.parse(r.detalhes as string) ? Object.entries(JSON.parse(r.detalhes as string)).map(([k, v]) => `${k}=${v}`).join(' ') : ''; } catch {}
      const ip = r.ip_address ? ` | IP: ${r.ip_address}` : '';
      return `[${data}] ${estado} | ${r.acao.padEnd(30)} | ${ator.padEnd(35)} | ${alvo.padEnd(20)}${ip}${det ? ' | ' + det : ''}`;
    });

    return header + linhas.join('\n') + '\n';
  }
}

export const auditoriaService = new AuditoriaService();

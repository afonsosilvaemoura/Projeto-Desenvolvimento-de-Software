// Define os dados mínimos para registar um evento de auditoria.
export interface CreateAuditoriaDto {
  acao:             string;
  entidade:         string;
  entidade_id?:     number | null;
  utilizador_id?:   number | null;
  utilizador_nome?: string;
  utilizador_role?: string;
  detalhes?:        Record<string, unknown>;
  ip?:              string;
  sucesso?:         boolean;
}

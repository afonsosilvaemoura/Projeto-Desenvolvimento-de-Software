export interface Auditoria {
  id:               number;
  admin_id:         number;   // ID do utilizador (não apenas admin)
  admin_nome:       string;   // Nome do utilizador
  acao:             string;
  entidade:         string;
  entidade_id?:     number | null;
  detalhes?:        string | null; // JSON serializado
  utilizador_role?: string | null;
  ip_address?:      string | null;
  sucesso:          number; // 0 | 1
  dataCriacao:      string;
}

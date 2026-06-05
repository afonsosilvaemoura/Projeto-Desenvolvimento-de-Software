export interface Medico {
  id:              number;
  nome:            string;
  username:        string;
  password_hash:   string;
  especialidade?:  string | null;
  numero_cedula?:  string | null;
  ativo:           number; // 0 | 1
  dataCriacao:     string;
  dataAtualizacao: string;
}

export interface Utente {
  id:                      number;
  nome:                    string;
  username:                string;
  password_hash:           string;
  email?:                  string | null;
  data_nascimento?:        string | null;
  nif?:                    string | null;
  telefone?:               string | null;
  sexo?:                   string | null;
  idade?:                  number | null;
  diagnostico_asma:        number; // 0 | 1
  data_primeira_consulta?: string | null;
  medico_id?:              number | null;
  ativo:                   number; // 0 | 1
  motivo_inativacao?:      string | null;
  rua?:                    string | null;
  numero_porta?:           string | null;
  codigo_postal?:          string | null;
  localidade?:             string | null;
  alergia?:                string | null;
  dataCriacao:             string;
  dataAtualizacao:         string;
}

export interface Exame {
  id:            number;
  utente_id:     number;
  tipo_exame:    string;
  exame:         string;
  medico_id?:    number | null;
  data_marcacao: string;
  data_criacao:  string;
}

// Define os dados de entrada para criar um exame.
export interface CreateExameDto {
  utente_id:     number;
  tipo_exame:    string;
  exame:         string;
  medico_id?:    number | null;
  data_marcacao: string;
}

// Define os dados de entrada para criar um exame..

export interface CreateExameDto {

  utente_id: number;
  medico_nome: string;
  tipo: string;
  justificacao: string;
  data_marcacao: Date; // Data em que o exame está marcado para acontecer

}

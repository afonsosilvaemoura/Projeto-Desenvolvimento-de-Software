// Define os dados devolvidos ao cliente na resposta.

export interface ExameResponseDto {

  id: number;
  utente_id: number;
  medico_nome: string;
  tipo: string;
  justificacao: string;
  data_marcacao: Date; // Data em que o exame está marcado para acontecer

}
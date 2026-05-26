// Define os dados devolvidos ao cliente na resposta.

export interface ExameResponseDto {

  id: number;
  utente_id: number;
  medico_nome: string;
  tipo: string;
  justificacao: string;
  data_marcacao: string;
  data_criacao: string; // Data de criação do registro

}
export interface PrescricaoResponseDto {
  id: number;
  utente_id: number;
  medico_nome: string;
  farmaco: string;
  dosagem: string;
  posologia: string;
  data_criacao: string;
}
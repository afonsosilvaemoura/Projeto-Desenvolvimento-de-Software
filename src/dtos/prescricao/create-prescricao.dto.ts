// Define os dados de entrada para criar uma prescrição.
export interface CreatePrescricaoDto {
  utente_id:    number;
  farmaco:      string;
  dosagem:      string;
  posologia:    string;
  medico_nome:  string;
}

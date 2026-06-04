// Define os dados de entrada para submeter um questionário CARAT.
export interface CreateCaratDto {
  perg1:      number;
  perg2:      number;
  perg3:      number;
  perg4:      number;
  perg5:      number;
  perg6:      number;
  perg7:      number;
  perg8:      number;
  perg9:      number;
  perg10:     number;
  utente_id?: number; // obrigatório quando submetido por médico
}

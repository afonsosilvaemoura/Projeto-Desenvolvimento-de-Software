// Define os dados de entrada para criar um utente.
export interface CreateUtenteDto {
  nome:                   string;
  username:               string;
  password:               string;
  sexo?:                  'M' | 'F';
  data_nascimento?:       string;
  diagnostico_asma?:      boolean | string; // pode chegar como 'true'/'false' via form
  data_primeira_consulta?: string;
  medico_id?:             number;
}

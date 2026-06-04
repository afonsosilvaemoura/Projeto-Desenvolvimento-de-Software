// Representa os dados devolvidos após criação ou listagem de prescrições.
export interface PrescricaoResponseDto {
  id:           number;
  utente_id:    number;
  utente_nome?: string;
  farmaco:      string;
  dosagem:      string;
  posologia:    string;
  medico_nome:  string;
  ativo:        number;
  data_criacao: string;
}

// Representa os dados devolvidos após criação ou listagem de exames.
export interface ExameResponseDto {
  id:            number;
  utente_id:     number;
  utente_nome?:  string;
  tipo_exame:    string;
  exame:         string;
  medico_id?:    number | null;
  medico_nome?:  string;
  data_marcacao: string;
  data_criacao:  string;
}

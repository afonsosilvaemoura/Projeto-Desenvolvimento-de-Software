// Representa os dados devolvidos após criação ou listagem de utentes.
export interface UtenteResponseDto {
  id:                      number;
  nome:                    string;
  username:                string;
  sexo?:                   string;
  idade?:                  number | null;
  diagnostico_asma:        boolean;
  data_primeira_consulta?: string;
  medico_id?:              number | null;
  ativo:                   number;
}

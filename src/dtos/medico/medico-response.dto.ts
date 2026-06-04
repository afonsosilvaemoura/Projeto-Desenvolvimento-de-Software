// Representa os dados devolvidos após criação ou listagem de médicos.
export interface MedicoResponseDto {
  id:             number;
  nome:           string;
  username:       string;
  especialidade?: string;
  numero_cedula?: string;
  ativo:          number;
  dataCriacao?:   string;
}

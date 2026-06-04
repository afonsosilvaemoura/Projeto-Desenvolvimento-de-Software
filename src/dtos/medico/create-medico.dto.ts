// Define os dados de entrada para criar um médico.
export interface CreateMedicoDto {
  nome:           string;
  username:       string;
  password:       string;
  especialidade?: string;
  numero_cedula?: string;
}

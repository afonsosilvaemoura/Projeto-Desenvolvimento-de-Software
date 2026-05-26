// Define os dados de entrada para criar um exame..

export interface CreateExameDto {
  id: number;
  tipo_exame: string;
  exame: string;
  medico_nome: string;
}
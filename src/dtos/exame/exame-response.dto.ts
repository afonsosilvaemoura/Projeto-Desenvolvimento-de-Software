// Define os dados devolvidos ao cliente na resposta.

export interface ExameResponseDto {
  id: number;
  tipo_exame: string;
  exame: string;
  medico_nome: string;
}
/* MedicoResponseDTO — forma devolvida ao cliente. */

export interface MedicoResponseDTO {
  user_id: string;
  especialidade?: string;
  ativo?: boolean;
}

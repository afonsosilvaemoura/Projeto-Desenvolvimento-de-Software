// Representa o resultado devolvido após processar uma avaliação CARAT.
export interface CaratResponseDto {
  id:           number | bigint;
  utente_id?:   number | null;
  scoreTotal:   number;
  scoreRinite:  number;
  scoreAsma:    number;
  controloTotal: 'CONTROLADA' | 'NAO_CONTROLADA';
  dataCriacao:  string;
}

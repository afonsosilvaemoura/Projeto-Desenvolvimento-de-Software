export interface AvaliacaoCarat {
  id:                   number;
  utente_id?:           number | null;
  medico_nome?:         string | null;
  respostas:            string; // JSON serializado
  scoreTotal:           number;
  scoreRinite:          number;
  scoreAsma:            number;
  nivelControlo:        'CONTROLADA' | 'NAO_CONTROLADA';
  recomendacao?:        string | null;
  proximoPassoSemanas?: number | null;
  anonima:              number; // 0 | 1
  dataCriacao:          string;
}

export const CARAT = {
  // Limiares de classificação
  SCORE_CONTROLADA:      25,   // >= 25 → Controlada
  SCORE_PARCIAL:         16,   // >= 16 e < 25 → Parcialmente controlada
                               // < 16 → Não controlada

  // Total de perguntas e valores possíveis
  NUM_PERGUNTAS:         10,
  VALOR_MIN_RESPOSTA:     0,
  VALOR_MAX_RESPOSTA:     4,
  SCORE_MAXIMO:          40,   // 10 perguntas × 4

  // Semanas até próxima avaliação
  SEMANAS_CONTROLADA:    12,
  SEMANAS_PARCIAL:        4,
  SEMANAS_NAO_CONTROLADA: 2,
} as const;

export function classificarScore(score: number): 'CONTROLADA' | 'PARCIALMENTE_CONTROLADA' | 'NAO_CONTROLADA' {
  if (score >= CARAT.SCORE_CONTROLADA) return 'CONTROLADA';
  if (score >= CARAT.SCORE_PARCIAL)    return 'PARCIALMENTE_CONTROLADA';
  return 'NAO_CONTROLADA';
}

export function corDoScore(score: number): string {
  if (score >= CARAT.SCORE_CONTROLADA) return '#28A745';
  if (score >= CARAT.SCORE_PARCIAL)    return '#F4D03F';
  return '#DC3545';
}

export function semanasProximaAvaliacao(score: number): number {
  if (score >= CARAT.SCORE_CONTROLADA) return CARAT.SEMANAS_CONTROLADA;
  if (score >= CARAT.SCORE_PARCIAL)    return CARAT.SEMANAS_PARCIAL;
  return CARAT.SEMANAS_NAO_CONTROLADA;
}
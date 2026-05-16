export const CARAT = {

  NUM_PERGUNTAS: 10,
  VALOR_MIN_RESPOSTA: 0,
  VALOR_MAX_RESPOSTA: 3,

  // Limiares Globais
  SCORE_MAXIMO_GLOBAL: 30,
  LIMIAR_BAIXO_CONTROLO_GLOBAL: 24, // <= 24 é baixo controlo

  // Limiares Rinite (Perguntas 1 a 4)
  SCORE_MAXIMO_RINITE: 12,
  LIMIAR_MAX_RINITE_MAL_CONTROLADA: 8,  // <= 8 é mal controlada

  // Limiares Asma (Perguntas 5 a 10)
  SCORE_MAXIMO_ASMA: 18,
  LIMIAR_MAX_ASMA_MAL_CONTROLADA: 16,   // < 16 é mal controlada

  // Semanas até próxima avaliação
  SEMANAS_BOM_CONTROLO: 12,
  SEMANAS_BAIXO_CONTROLO: 4,
} as const;

export interface ResultadoCARAT {
  scoreTotal: number;
  scoreRinite: number;
  scoreAsma: number;
  controloTotal: 'CONTROLADA' | 'NAO_CONTROLADA';
  riniteControlada: boolean;
  asmaControlada: boolean;
}

/**
 * Calcula e classifica os resultados com base num array de 10 respostas (valores de 0 a 3)
 */
export function calcularCARAT(respostas: number[]): ResultadoCARAT {
  if (respostas.length !== CARAT.NUM_PERGUNTAS) {
    throw new Error(`O questionário deve ter exatamente ${CARAT.NUM_PERGUNTAS} respostas.`);
  }

  // Separar as respostas por secções 
  const respostasRinite = respostas.slice(1, 4);
  const respostasAsma = respostas.slice(5, 10);

  // Somar as pontuações
  const scoreRinite = respostasRinite.reduce((acc, val) => acc + val, 0);
  const scoreAsma = respostasAsma.reduce((acc, val) => acc + val, 0);
  const scoreTotal = scoreRinite + scoreAsma;


  const controloTotal = scoreTotal <= CARAT.LIMIAR_BAIXO_CONTROLO_GLOBAL ? 'CONTROLADA' : 'NAO_CONTROLADA';
  const riniteControlada = scoreRinite > CARAT.LIMIAR_MAX_RINITE_MAL_CONTROLADA; // <= 8 é mal controlada
  const asmaControlada = scoreAsma >= CARAT.LIMIAR_MAX_ASMA_MAL_CONTROLADA;     // < 16 é mal controlada

  return {
    scoreTotal: scoreTotal,
    scoreRinite,
    scoreAsma,
    controloTotal: controloTotal,
    riniteControlada,
    asmaControlada
  };
}

// Funções Auxiliares de Visualização
export function corDoScoreGlobal(scoreGlobal: number): string {
  return scoreGlobal <= CARAT.LIMIAR_BAIXO_CONTROLO_GLOBAL ? '#DC3545' : '#28A745'; 
}

export function semanasProximaAvaliacao(scoreGlobal: number): number {
  return scoreGlobal <= CARAT.LIMIAR_BAIXO_CONTROLO_GLOBAL 
    ? CARAT.SEMANAS_BAIXO_CONTROLO 
    : CARAT.SEMANAS_BOM_CONTROLO;
}
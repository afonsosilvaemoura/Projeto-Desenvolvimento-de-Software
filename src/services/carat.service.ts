export const PERGUNTAS_CARAT = [
  'Nas últimas 4 semanas, quantas vezes teve o nariz entupido?',
  'Nas últimas 4 semanas, quantas vezes teve espirros?',
  'Nas últimas 4 semanas, quantas vezes teve comichão no nariz?',
  'Nas últimas 4 semanas, quantas vezes teve corrimento/pingo do nariz?',
  'Nas últimas 4 semanas, quantas vezes teve falta de ar/dispeneia?',
  'Nas últimas 4 semanas, quantas vezes teve chiadeira no peito/pieira?',
  'Nas últimas 4 semanas, quantas vezes teve aperto no peito com esforço físico?',
  'Nas últimas 4 semanas, quantas vezes sentiu cansaço/dificuldade em fazer tarefas do dia-a-dia?',
  'Nas últimas 4 semanas, quantas vezes acordou durante a noite devido a sintomas?',
  'Nas últimas 4 semanas, teve de aumentar a utilização dos seus medicamentos, por causa das suas doenças alérgicas/rinite/asma?',
];

export const OPCOES_RESPOSTA = [
  { valor: 3, label: 'Nunca' },
  { valor: 2, label: '1 a 2x por semana' },
  { valor: 1, label: 'Mais de 2 dias por semana' },
  { valor: 0, label: 'Quase ou todos os dias' },
];

export const CARAT = {
  NUM_PERGUNTAS: 10,
  SCORE_MAXIMO_GLOBAL: 30,
  LIMIAR_BAIXO_CONTROLO_GLOBAL: 24,
  SCORE_MAXIMO_RINITE: 12,
  LIMIAR_MAX_RINITE_MAL_CONTROLADA: 8,
  SCORE_MAXIMO_ASMA: 18,
  LIMIAR_MAX_ASMA_MAL_CONTROLADA: 16,
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

export function calcularCARAT(respostas: number[]): ResultadoCARAT {
  if (respostas.length !== CARAT.NUM_PERGUNTAS)
    throw new Error(`O questionário deve ter exatamente ${CARAT.NUM_PERGUNTAS} respostas.`);

  const scoreRinite = respostas.slice(0, 4).reduce((a, v) => a + v, 0);
  const scoreAsma   = respostas.slice(4, 10).reduce((a, v) => a + v, 0);
  const scoreTotal  = scoreRinite + scoreAsma;

  return {
    scoreTotal,
    scoreRinite,
    scoreAsma,
    controloTotal:    scoreTotal > 24 ? 'CONTROLADA' : 'NAO_CONTROLADA',
    riniteControlada: scoreRinite > CARAT.LIMIAR_MAX_RINITE_MAL_CONTROLADA,
    asmaControlada:   scoreAsma  >= CARAT.LIMIAR_MAX_ASMA_MAL_CONTROLADA,
  };
}

import { NivelControlo, PrioridadeAlerta, TipoAlerta } from '../models/todos.entity';
import { getDb } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

// =============================================
// LÓGICA CARAT
// O questionário tem 10 perguntas, cada uma
// pontuada de 0 a 4. Score total: 0-40.
// ≥ 25 → Controlada
// 16-24 → Parcialmente controlada
// < 16  → Não controlada
// =============================================

export const CARAT_NUM_PERGUNTAS = 10;
export const CARAT_MIN_VALOR = 0;
export const CARAT_MAX_VALOR = 4;

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

export function calcularScore(respostas: number[]): number {
  if (respostas.length !== CARAT_NUM_PERGUNTAS) {
    throw new Error(`O questionário CARAT requer exatamente ${CARAT_NUM_PERGUNTAS} respostas.`);
  }
  respostas.forEach((r, i) => {
    if (r < CARAT_MIN_VALOR || r > CARAT_MAX_VALOR) {
      throw new Error(`Resposta ${i + 1} inválida: deve ser entre ${CARAT_MIN_VALOR} e ${CARAT_MAX_VALOR}.`);
    }
  });
  return respostas.reduce((sum, r) => sum + r, 0);
}

export function interpretarScore(score: number): NivelControlo {
  if (score >= 25) return NivelControlo.CONTROLADA;
  if (score >= 16) return NivelControlo.PARCIALMENTE_CONTROLADA;
  return NivelControlo.NAO_CONTROLADA;
}

export function gerarRecomendacoes(nivel: NivelControlo): string {
  switch (nivel) {
    case NivelControlo.CONTROLADA:
      return 'A doença encontra-se bem controlada. Mantenha a medicação atual e realize avaliação de rotina em 12 semanas.';
    case NivelControlo.PARCIALMENTE_CONTROLADA:
      return 'A doença está parcialmente controlada. Reveja a técnica inalatória, avalie a adesão à medicação e marque consulta nas próximas 4 semanas.';
    case NivelControlo.NAO_CONTROLADA:
      return 'A doença não está controlada. É necessária consulta urgente. Contacte o seu médico ou dirija-se a uma urgência se tiver dificuldade respiratória grave.';
  }
}

export function calcularProximoPasso(nivel: NivelControlo): number {
  switch (nivel) {
    case NivelControlo.CONTROLADA: return 12;
    case NivelControlo.PARCIALMENTE_CONTROLADA: return 4;
    case NivelControlo.NAO_CONTROLADA: return 2;
  }
}

export function gerarAlertasSeNecessario(
  avaliacaoId: string,
  utenteId: string,
  medicoId: string,
  score: number,
  scoreAnterior: number | null
): void {
  const db = getDb();
  const now = new Date().toISOString();

  const limiar = db.prepare('SELECT * FROM limiares_alerta LIMIT 1').get() as {
    score_minimo: number;
    deterioracao_pontos: number;
  };

  // Alerta 1: score abaixo do limiar
  if (score < limiar.score_minimo) {
    const prioridade = score < 8 ? PrioridadeAlerta.CRITICA : PrioridadeAlerta.ALTA;
    db.prepare(`INSERT INTO alertas (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      uuidv4(), utenteId, medicoId, avaliacaoId,
      TipoAlerta.SCORE_BAIXO, prioridade,
      `Score CARAT de ${score}, abaixo do limiar configurado de ${limiar.score_minimo} pontos.`,
      'NOVO', now, now
    );
  }

  // Alerta 2: deterioração face à última avaliação
  if (scoreAnterior !== null) {
    const queda = scoreAnterior - score;
    if (queda >= limiar.deterioracao_pontos) {
      const prioridade = queda >= 10 ? PrioridadeAlerta.CRITICA : PrioridadeAlerta.ALTA;
      db.prepare(`INSERT INTO alertas (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
        VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
        uuidv4(), utenteId, medicoId, avaliacaoId,
        TipoAlerta.DETERIORACAO, prioridade,
        `Deterioração de ${queda} pontos face à avaliação anterior (${scoreAnterior} → ${score}).`,
        'NOVO', now, now
      );
    }
  }
}

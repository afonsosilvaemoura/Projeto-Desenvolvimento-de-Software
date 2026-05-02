"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPCOES_RESPOSTA = exports.PERGUNTAS_CARAT = exports.CARAT_MAX_VALOR = exports.CARAT_MIN_VALOR = exports.CARAT_NUM_PERGUNTAS = void 0;
exports.calcularScore = calcularScore;
exports.interpretarScore = interpretarScore;
exports.gerarRecomendacoes = gerarRecomendacoes;
exports.calcularProximoPasso = calcularProximoPasso;
exports.gerarAlertasSeNecessario = gerarAlertasSeNecessario;
const entities_1 = require("../models/entities");
const db_1 = require("../database/db");
const uuid_1 = require("uuid");
// =============================================
// LÓGICA CARAT
// O questionário tem 10 perguntas, cada uma
// pontuada de 0 a 4. Score total: 0-40.
// ≥ 25 → Controlada
// 16-24 → Parcialmente controlada
// < 16  → Não controlada
// =============================================
exports.CARAT_NUM_PERGUNTAS = 10;
exports.CARAT_MIN_VALOR = 0;
exports.CARAT_MAX_VALOR = 4;
exports.PERGUNTAS_CARAT = [
    'Nas últimas 4 semanas, quantas vezes teve sintomas nasais (corrimento, obstrução, espirros)?',
    'Nas últimas 4 semanas, quantas vezes os sintomas nasais afetaram o seu sono?',
    'Nas últimas 4 semanas, quantas vezes os sintomas nasais afetaram as suas atividades diárias?',
    'Nas últimas 4 semanas, quantas vezes teve olhos vermelhos, lacrimejantes ou com comichão?',
    'Nas últimas 4 semanas, quantas vezes usou medicação para a rinite?',
    'Nas últimas 4 semanas, quantas vezes acordou de noite devido a sintomas de asma?',
    'Nas últimas 4 semanas, quantas vezes teve pieira ou aperto no peito?',
    'Nas últimas 4 semanas, quantas vezes a asma limitou as suas atividades físicas?',
    'Nas últimas 4 semanas, quantas vezes teve crises de falta de ar?',
    'Nas últimas 4 semanas, como avalia o seu controlo geral da doença respiratória?',
];
exports.OPCOES_RESPOSTA = [
    { valor: 4, label: 'Nunca / Muito bem controlada' },
    { valor: 3, label: 'Raramente (1-2x)' },
    { valor: 2, label: 'Algumas vezes (3-7x)' },
    { valor: 1, label: 'Frequentemente (8-14x)' },
    { valor: 0, label: 'Sempre / Muito mal controlada' },
];
function calcularScore(respostas) {
    if (respostas.length !== exports.CARAT_NUM_PERGUNTAS) {
        throw new Error(`O questionário CARAT requer exatamente ${exports.CARAT_NUM_PERGUNTAS} respostas.`);
    }
    respostas.forEach((r, i) => {
        if (r < exports.CARAT_MIN_VALOR || r > exports.CARAT_MAX_VALOR) {
            throw new Error(`Resposta ${i + 1} inválida: deve ser entre ${exports.CARAT_MIN_VALOR} e ${exports.CARAT_MAX_VALOR}.`);
        }
    });
    return respostas.reduce((sum, r) => sum + r, 0);
}
function interpretarScore(score) {
    if (score >= 25)
        return entities_1.NivelControlo.CONTROLADA;
    if (score >= 16)
        return entities_1.NivelControlo.PARCIALMENTE_CONTROLADA;
    return entities_1.NivelControlo.NAO_CONTROLADA;
}
function gerarRecomendacoes(nivel) {
    switch (nivel) {
        case entities_1.NivelControlo.CONTROLADA:
            return 'A doença encontra-se bem controlada. Mantenha a medicação atual e realize avaliação de rotina em 12 semanas.';
        case entities_1.NivelControlo.PARCIALMENTE_CONTROLADA:
            return 'A doença está parcialmente controlada. Reveja a técnica inalatória, avalie a adesão à medicação e marque consulta nas próximas 4 semanas.';
        case entities_1.NivelControlo.NAO_CONTROLADA:
            return 'A doença não está controlada. É necessária consulta urgente. Contacte o seu médico ou dirija-se a uma urgência se tiver dificuldade respiratória grave.';
    }
}
function calcularProximoPasso(nivel) {
    switch (nivel) {
        case entities_1.NivelControlo.CONTROLADA: return 12;
        case entities_1.NivelControlo.PARCIALMENTE_CONTROLADA: return 4;
        case entities_1.NivelControlo.NAO_CONTROLADA: return 2;
    }
}
function gerarAlertasSeNecessario(avaliacaoId, utenteId, medicoId, score, scoreAnterior) {
    const db = (0, db_1.getDb)();
    const now = new Date().toISOString();
    const limiar = db.prepare('SELECT * FROM limiares_alerta LIMIT 1').get();
    // Alerta 1: score abaixo do limiar
    if (score < limiar.score_minimo) {
        const prioridade = score < 8 ? entities_1.PrioridadeAlerta.CRITICA : entities_1.PrioridadeAlerta.ALTA;
        db.prepare(`INSERT INTO alertas (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
      VALUES (?,?,?,?,?,?,?,?,?,?)`).run((0, uuid_1.v4)(), utenteId, medicoId, avaliacaoId, entities_1.TipoAlerta.SCORE_BAIXO, prioridade, `Score CARAT de ${score}, abaixo do limiar configurado de ${limiar.score_minimo} pontos.`, 'NOVO', now, now);
    }
    // Alerta 2: deterioração face à última avaliação
    if (scoreAnterior !== null) {
        const queda = scoreAnterior - score;
        if (queda >= limiar.deterioracao_pontos) {
            const prioridade = queda >= 10 ? entities_1.PrioridadeAlerta.CRITICA : entities_1.PrioridadeAlerta.ALTA;
            db.prepare(`INSERT INTO alertas (id,utente_id,medico_id,avaliacao_id,tipo,prioridade,motivo,estado,criado_em,atualizado_em)
        VALUES (?,?,?,?,?,?,?,?,?,?)`).run((0, uuid_1.v4)(), utenteId, medicoId, avaliacaoId, entities_1.TipoAlerta.DETERIORACAO, prioridade, `Deterioração de ${queda} pontos face à avaliação anterior (${scoreAnterior} → ${score}).`, 'NOVO', now, now);
        }
    }
}

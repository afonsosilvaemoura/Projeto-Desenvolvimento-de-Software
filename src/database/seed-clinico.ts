import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data.db'));

const u = (username: string) => (db.prepare('SELECT id FROM utente WHERE username = ?').get(username) as any)?.id;
const m = (username: string) => (db.prepare('SELECT id, nome FROM medico WHERE username = ?').get(username) as any);

const joao      = u('joao');       // asma=1, CARAT 30 → CONTROLADA
const pedro     = u('pedro');      // asma=1, CARAT 28 → CONTROLADA
const ana       = u('ana');        // asma=1, CARAT 14 → NAO_CONTROLADA
const sofia     = u('sofia');      // asma=1, CARAT  5 → CRITICA
const catarina  = u('catarina');   // asma=1, CARAT 24 → NAO_CONTROLADA
const diogo     = u('diogo');      // asma=1, CARAT 14 → NAO_CONTROLADA
const antonio   = u('antonio');    // asma=1, CARAT 25 → CONTROLADA
const margarida = u('margarida');  // asma=1, CARAT 13 → NAO_CONTROLADA
const ines      = u('ines');       // asma=1, CARAT  6 → CRITICA
const maria     = u('maria');      // asma=0, rinite
const rui       = u('rui');        // asma=0, rinite
const miguel    = u('miguel');     // asma=0, rinite
const helena    = u('helena');     // asma=0, rinite
const tiago     = u('tiago');      // asma=0, rinite
const bruno     = u('bruno');      // asma=0, rinite

const carlos = m('medico1');  // Dr. Carlos Silva
const ana_f  = m('medico2');  // Dr.ª Ana Ferreira
const rui_c  = m('medico3');  // Dr. Rui Costa

const now = new Date().toISOString();

const insP = db.prepare(
  'INSERT INTO prescricao (utente_id, medico_nome, farmaco, dosagem, posologia, data_criacao) VALUES (?, ?, ?, ?, ?, ?)'
);
const insE = db.prepare(
  'INSERT INTO exame (utente_id, tipo_exame, exame, medico_id, data_marcacao, data_criacao) VALUES (?, ?, ?, ?, ?, ?)'
);

function d(daysAgo: number) {
  const dt = new Date(); dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().split('T')[0];
}

// ────────────────────────────────────────────────────────────
// PRESCRIÇÕES
// ────────────────────────────────────────────────────────────

// === ASMA CONTROLADA (João, Pedro, António) ===
// GINA Step 3 — ICS/LABA baixa dose + resgate
for (const [uid, med] of [[joao, carlos], [pedro, carlos], [antonio, rui_c]] as [number, any][]) {
  insP.run(uid, med.nome, 'Budesonida/Formoterol 160/4,5 mcg (Symbicort Turbuhaler)', '1 inalação', '2x/dia (manutenção); 1 inalação extra em crise (máx. 8/dia)', now);
  insP.run(uid, med.nome, 'Salbutamol 100 mcg (Ventolin inalador)', '2 inalações', 'Quando necessário (resgate); máx. 8 inalações/dia', now);
  insP.run(uid, med.nome, 'Propionato de Fluticasona 50 mcg nasal (Flixonase)', '2 pulverizações/narina', '1x/dia (manhã)', now);
}

// === ASMA NAO_CONTROLADA (Ana, Catarina, Diogo, Margarida) ===
// GINA Step 4 — ICS/LABA dose média + LTRA + rinite
for (const [uid, med] of [[ana, carlos], [catarina, ana_f], [diogo, ana_f], [margarida, rui_c]] as [number, any][]) {
  insP.run(uid, med.nome, 'Salmeterol/Fluticasona 50/500 mcg (Seretide Diskus)', '1 inalação', '2x/dia', now);
  insP.run(uid, med.nome, 'Salbutamol 100 mcg (Ventolin inalador)', '2 inalações', 'Até 4x/dia quando necessário (SOS); se precisar mais consultar médico', now);
  insP.run(uid, med.nome, 'Montelucaste 10 mg (Singulair)', '1 comprimido', '1x/dia ao deitar', now);
  insP.run(uid, med.nome, 'Furoato de Mometasona 50 mcg nasal (Nasonex)', '2 pulverizações/narina', '1x/dia', now);
}

// === ASMA CRITICA (Sofia, Inês) ===
// GINA Step 5 — ICS/LABA alta dose + LAMA + LTRA + corticoide oral
for (const [uid, med] of [[sofia, ana_f], [ines, rui_c]] as [number, any][]) {
  insP.run(uid, med.nome, 'Salmeterol/Fluticasona 50/500 mcg (Seretide Diskus)', '1 inalação', '2x/dia', now);
  insP.run(uid, med.nome, 'Tiotrópio 2,5 mcg (Spiriva Respimat)', '2 pulverizações', '1x/dia (manhã)', now);
  insP.run(uid, med.nome, 'Montelucaste 10 mg (Singulair)', '1 comprimido', '1x/dia ao deitar', now);
  insP.run(uid, med.nome, 'Prednisolona 30 mg', '1 comprimido', '1x/dia durante 5 dias (exacerbação aguda)', now);
  insP.run(uid, med.nome, 'Salbutamol 100 mcg (Ventolin inalador)', '2 inalações', 'De 4 em 4 horas (fase aguda); SOS após controlo', now);
  insP.run(uid, med.nome, 'Furoato de Mometasona 50 mcg nasal (Nasonex)', '2 pulverizações/narina', '1x/dia', now);
}

// === RINITE SEM ASMA (Maria, Rui, Miguel, Helena, Tiago, Bruno) ===
for (const [uid, med] of [[maria, carlos], [rui, carlos], [miguel, ana_f], [helena, ana_f], [tiago, rui_c], [bruno, rui_c]] as [number, any][]) {
  insP.run(uid, med.nome, 'Loratadina 10 mg (Clarityne)', '1 comprimido', '1x/dia', now);
  insP.run(uid, med.nome, 'Budesonida 64 mcg nasal (Rhinocort)', '2 pulverizações/narina', '1x/dia (manhã)', now);
}

console.log('Prescrições inseridas.');

// ────────────────────────────────────────────────────────────
// EXAMES
// ────────────────────────────────────────────────────────────

// === TODOS OS ASMÁTICOS ===
for (const [uid, med] of [[joao, carlos], [pedro, carlos], [ana, carlos], [sofia, ana_f], [catarina, ana_f], [diogo, ana_f], [antonio, rui_c], [margarida, rui_c], [ines, rui_c]] as [number, any][]) {
  insE.run(uid, 'Função Pulmonar', 'Espirometria com prova de reversibilidade com salbutamol', med.id, d(30), now);
  insE.run(uid, 'Função Pulmonar', 'Débito Expiratório de Pico (Peak Flow)', med.id, d(15), now);
  insE.run(uid, 'Alergia', 'Testes cutâneos de alergia por prick test (ácaros, gramíneas, fungos, animais)', med.id, d(45), now);
  insE.run(uid, 'Análises', 'IgE sérica total e IgE específica (Dermatophagoides, gramíneas, Alternaria)', med.id, d(40), now);
}

// === ASMA CONTROLADA — exames adicionais de monitorização ===
for (const [uid, med] of [[joao, carlos], [pedro, carlos], [antonio, rui_c]] as [number, any][]) {
  insE.run(uid, 'Função Pulmonar', 'Fração de Óxido Nítrico Expirado (FeNO)', med.id, d(20), now);
}

// === ASMA NAO_CONTROLADA — exames adicionais ===
for (const [uid, med] of [[ana, carlos], [catarina, ana_f], [diogo, ana_f], [margarida, rui_c]] as [number, any][]) {
  insE.run(uid, 'Análises', 'Hemograma completo com diferencial leucocitário', med.id, d(10), now);
  insE.run(uid, 'Análises', 'PCR e velocidade de sedimentação (VS)', med.id, d(10), now);
  insE.run(uid, 'Imagiologia', 'Radiografia do tórax PA e perfil', med.id, d(25), now);
}

// === ASMA CRITICA — exames urgentes ===
for (const [uid, med] of [[sofia, ana_f], [ines, rui_c]] as [number, any][]) {
  insE.run(uid, 'Análises', 'Hemograma completo urgente', med.id, d(3), now);
  insE.run(uid, 'Análises', 'Gasometria arterial', med.id, d(3), now);
  insE.run(uid, 'Imagiologia', 'Radiografia do tórax PA e perfil', med.id, d(5), now);
  insE.run(uid, 'Função Pulmonar', 'Oximetria de pulso em repouso e esforço', med.id, d(4), now);
  insE.run(uid, 'Imagiologia', 'TC torácica de alta resolução (TCAR)', med.id, d(60), now);
}

// === RINITE SEM ASMA ===
for (const [uid, med] of [[maria, carlos], [rui, carlos], [miguel, ana_f], [helena, ana_f], [tiago, rui_c], [bruno, rui_c]] as [number, any][]) {
  insE.run(uid, 'ORL', 'Rinoscopia anterior', med.id, d(30), now);
  insE.run(uid, 'Alergia', 'Testes cutâneos de alergia por prick test', med.id, d(35), now);
  insE.run(uid, 'Análises', 'IgE sérica total e IgE específica', med.id, d(32), now);
}

// Rinite grave (Rui, Helena — mais velhos, maior probabilidade de complicações)
for (const [uid, med] of [[rui, carlos], [helena, ana_f]] as [number, any][]) {
  insE.run(uid, 'Imagiologia', 'TC dos seios perinasais (coronal e axial)', med.id, d(20), now);
}

db.close();
console.log('\nSeed clínico concluído!');
console.log('Prescrições e exames inseridos com base no controlo da asma e rinite.');

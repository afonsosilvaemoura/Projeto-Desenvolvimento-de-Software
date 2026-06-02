import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS administrador (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, dataCriacao TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS medico (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    especialidade TEXT, numero_cedula TEXT, ativo INTEGER DEFAULT 1,
    dataCriacao TEXT NOT NULL, dataAtualizacao TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS utente (
    id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE, email TEXT, password_hash TEXT NOT NULL,
    data_nascimento TEXT, nif TEXT, telefone TEXT, sexo TEXT, idade INTEGER,
    diagnostico_asma INTEGER DEFAULT 0, data_primeira_consulta TEXT, medico_id INTEGER,
    ativo INTEGER DEFAULT 1, dataCriacao TEXT NOT NULL, dataAtualizacao TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS avaliacao_carat (
    id INTEGER PRIMARY KEY AUTOINCREMENT, utente_id INTEGER, medico_nome TEXT,
    respostas TEXT NOT NULL, scoreTotal INTEGER NOT NULL, scoreRinite INTEGER NOT NULL,
    scoreAsma INTEGER NOT NULL, nivelControlo TEXT NOT NULL, recomendacao TEXT,
    proximoPassoSemanas INTEGER, anonima INTEGER DEFAULT 0, dataCriacao TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS limiar_alerta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scoreMinimo INTEGER DEFAULT 24, deterioracaoPontos INTEGER DEFAULT 3,
    dataAtualizacao TEXT NOT NULL
  );
`);

const now = new Date().toISOString();

// Admin
db.prepare('INSERT OR IGNORE INTO administrador (nome, username, password_hash, dataCriacao) VALUES (?, ?, ?, ?)')
  .run('Administrador SAUDINOB', 'admin', bcrypt.hashSync('1234.', 10), now);
console.log('admin / 1234.');

// Médicos
const medicosData = [
  { nome: 'Dr. Carlos Silva',  username: 'medico1', especialidade: 'Pneumologia',     cedula: 'OM-12345' },
  { nome: 'Dr.ª Ana Ferreira', username: 'medico2', especialidade: 'Alergologia',      cedula: 'OM-23456' },
  { nome: 'Dr. Rui Costa',     username: 'medico3', especialidade: 'Medicina Interna', cedula: 'OM-34567' },
];
const insertMedico = db.prepare(
  'INSERT OR IGNORE INTO medico (nome, username, password_hash, especialidade, numero_cedula, ativo, dataCriacao, dataAtualizacao) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
);
const medicoIds: number[] = [];
for (const m of medicosData) {
  const result = insertMedico.run(m.nome, m.username, bcrypt.hashSync('1234.', 10), m.especialidade, m.cedula, now, now);
  const id = result.lastInsertRowid ? Number(result.lastInsertRowid) : (db.prepare('SELECT id FROM medico WHERE username=?').get(m.username) as any).id;
  medicoIds.push(id);
  console.log(`${m.nome} (${m.username} / 1234.)`);
}

// Utentes
const utentesData = [
  { nome: 'João Silva',       username: 'joao',      sexo: 'M', idade: 45, asma: 1, consulta: '2020-03-15', midx: 0 },
  { nome: 'Maria Santos',     username: 'maria',     sexo: 'F', idade: 32, asma: 0, consulta: '2021-06-10', midx: 0 },
  { nome: 'Pedro Oliveira',   username: 'pedro',     sexo: 'M', idade: 58, asma: 1, consulta: '2019-11-20', midx: 0 },
  { nome: 'Ana Costa',        username: 'ana',       sexo: 'F', idade: 27, asma: 1, consulta: '2022-01-08', midx: 0 },
  { nome: 'Rui Fernandes',    username: 'rui',       sexo: 'M', idade: 63, asma: 0, consulta: '2018-09-14', midx: 0 },
  { nome: 'Sofia Martins',    username: 'sofia',     sexo: 'F', idade: 41, asma: 1, consulta: '2021-02-25', midx: 1 },
  { nome: 'Miguel Pereira',   username: 'miguel',    sexo: 'M', idade: 35, asma: 0, consulta: '2022-07-19', midx: 1 },
  { nome: 'Catarina Lopes',   username: 'catarina',  sexo: 'F', idade: 52, asma: 1, consulta: '2020-05-03', midx: 1 },
  { nome: 'Diogo Alves',      username: 'diogo',     sexo: 'M', idade: 29, asma: 1, consulta: '2023-03-12', midx: 1 },
  { nome: 'Helena Rodrigues', username: 'helena',    sexo: 'F', idade: 67, asma: 0, consulta: '2017-12-01', midx: 1 },
  { nome: 'António Gomes',    username: 'antonio',   sexo: 'M', idade: 48, asma: 1, consulta: '2019-08-22', midx: 2 },
  { nome: 'Margarida Sousa',  username: 'margarida', sexo: 'F', idade: 38, asma: 1, consulta: '2021-04-17', midx: 2 },
  { nome: 'Tiago Mendes',     username: 'tiago',     sexo: 'M', idade: 55, asma: 0, consulta: '2020-10-30', midx: 2 },
  { nome: 'Inês Carvalho',    username: 'ines',      sexo: 'F', idade: 31, asma: 1, consulta: '2022-09-05', midx: 2 },
  { nome: 'Bruno Pinto',      username: 'bruno',     sexo: 'M', idade: 72, asma: 0, consulta: '2016-06-18', midx: 2 },
];
const insertUtente = db.prepare(
  'INSERT OR IGNORE INTO utente (nome, username, password_hash, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id, ativo, dataCriacao, dataAtualizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)'
);
const utenteIds: number[] = [];
for (const u of utentesData) {
  const result = insertUtente.run(u.nome, u.username, bcrypt.hashSync('1234', 10), u.sexo, u.idade, u.asma, u.consulta, medicoIds[u.midx], now, now);
  const id = result.lastInsertRowid ? Number(result.lastInsertRowid) : (db.prepare('SELECT id FROM utente WHERE username=?').get(u.username) as any).id;
  utenteIds.push(id);
}
console.log(`${utenteIds.length} utentes (password: 1234)`);

// CARAT
const baseScores = [
  [3,3,3,3,3,3,3,3,3,3],[2,2,2,2,2,2,2,2,2,2],[3,3,2,3,3,3,3,3,2,3],[1,1,2,1,2,2,1,1,2,1],[2,3,3,2,3,2,3,2,3,2],
  [0,1,1,0,1,0,1,0,1,0],[3,2,3,3,3,3,2,3,3,3],[2,2,3,2,3,3,2,3,2,2],[1,2,1,1,2,1,2,1,2,1],[3,3,3,2,3,3,3,3,3,2],
  [2,3,2,3,2,3,2,3,2,3],[1,1,1,2,1,2,1,2,1,1],[3,3,3,3,2,3,3,2,3,3],[0,1,0,1,1,1,0,1,0,1],[2,2,2,3,2,2,3,2,2,2],
];
const insertCarat = db.prepare(
  'INSERT INTO avaliacao_carat (utente_id, respostas, scoreTotal, scoreRinite, scoreAsma, nivelControlo, recomendacao, proximoPassoSemanas, anonima, dataCriacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)'
);
let caratCount = 0;
for (let i = 0; i < utenteIds.length; i++) {
  for (let j = 0; j < 2; j++) {
    const res = baseScores[i].map((v: number) => Math.max(0, Math.min(3, v - j)));
    const scoreTotal  = res.reduce((a: number, v: number) => a + v, 0);
    const scoreRinite = res.slice(0,4).reduce((a: number, v: number) => a + v, 0);
    const scoreAsma   = res.slice(4).reduce((a: number, v: number) => a + v, 0);
    const controlada  = scoreTotal > 24;
    insertCarat.run(
      utenteIds[i], JSON.stringify(res), scoreTotal, scoreRinite, scoreAsma,
      controlada ? 'CONTROLADA' : 'NAO_CONTROLADA',
      controlada ? 'Controlado — próxima avaliação em 12 semanas.' : 'Consultar médico com brevidade.',
      controlada ? 12 : 4,
      new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000).toISOString()
    );
    caratCount++;
  }
}
console.log(`${caratCount} avaliações CARAT`);

// Limiar
const limiarExiste = db.prepare('SELECT id FROM limiar_alerta LIMIT 1').get();
if (!limiarExiste) {
  db.prepare('INSERT INTO limiar_alerta (scoreMinimo, deterioracaoPontos, dataAtualizacao) VALUES (24, 3, ?)').run(now);
  console.log('LimiarAlerta criado');
}

db.close();
console.log('\nSeed concluído!');

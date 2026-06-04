import Database from 'better-sqlite3';
import path from 'path';

export const db = new Database(path.join(process.cwd(), 'data.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS utente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    data_nascimento TEXT,
    nif TEXT,
    telefone TEXT,
    sexo TEXT,
    idade INTEGER,
    diagnostico_asma INTEGER NOT NULL DEFAULT 0,
    data_primeira_consulta TEXT,
    medico_id INTEGER,
    ativo INTEGER NOT NULL DEFAULT 1,
    dataCriacao TEXT NOT NULL,
    dataAtualizacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    especialidade TEXT,
    numero_cedula TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    dataCriacao TEXT NOT NULL,
    dataAtualizacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS administrador (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    dataCriacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prescricao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER NOT NULL,
    medico_nome TEXT NOT NULL,
    farmaco TEXT NOT NULL,
    dosagem TEXT NOT NULL,
    posologia TEXT NOT NULL,
    data_criacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS exame (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER NOT NULL,
    tipo_exame TEXT NOT NULL,
    exame TEXT NOT NULL,
    medico_id INTEGER,
    data_marcacao TEXT NOT NULL,
    data_criacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS avaliacao_carat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER,
    medico_nome TEXT,
    respostas TEXT NOT NULL,
    scoreTotal INTEGER NOT NULL,
    scoreRinite INTEGER NOT NULL,
    scoreAsma INTEGER NOT NULL,
    nivelControlo TEXT NOT NULL,
    recomendacao TEXT,
    proximoPassoSemanas INTEGER,
    anonima INTEGER NOT NULL DEFAULT 0,
    dataCriacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS alerta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    utente_id INTEGER NOT NULL,
    medico_nome TEXT,
    avaliacao_id INTEGER,
    tipo TEXT NOT NULL,
    prioridade TEXT NOT NULL,
    motivo TEXT,
    estado TEXT NOT NULL DEFAULT 'NOVO',
    dataCriacao TEXT NOT NULL,
    dataAtualizacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS limiar_alerta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scoreMinimo INTEGER NOT NULL DEFAULT 24,
    deterioracaoPontos INTEGER NOT NULL DEFAULT 3,
    dataAtualizacao TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    admin_nome TEXT NOT NULL,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id INTEGER,
    detalhes TEXT,
    dataCriacao TEXT NOT NULL
  );
`);

try { db.exec('ALTER TABLE utente ADD COLUMN motivo_inativacao TEXT'); } catch {}
try { db.exec('ALTER TABLE prescricao ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN morada TEXT'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN alergia TEXT'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN rua TEXT'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN numero_porta TEXT'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN codigo_postal TEXT'); } catch {}
try { db.exec('ALTER TABLE utente ADD COLUMN localidade TEXT'); } catch {}
try { db.exec('ALTER TABLE prescricao ADD COLUMN embalagens_total INTEGER NOT NULL DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE prescricao ADD COLUMN embalagens_levantadas INTEGER NOT NULL DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE auditoria ADD COLUMN utilizador_role TEXT'); } catch {}
try { db.exec('ALTER TABLE auditoria ADD COLUMN ip_address TEXT'); } catch {}
try { db.exec('ALTER TABLE auditoria ADD COLUMN sucesso INTEGER NOT NULL DEFAULT 1'); } catch {}

console.log('Base de dados inicializada');

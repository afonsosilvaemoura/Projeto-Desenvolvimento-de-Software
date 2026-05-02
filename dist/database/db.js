"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../saudinob.db');
let db;
function getDb() {
    if (!db) {
        db = new better_sqlite3_1.default(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        runMigrations(db);
    }
    return db;
}
function runMigrations(db) {
    db.exec(`
    -- UTILIZADORES (tabela base)
    CREATE TABLE IF NOT EXISTS utilizadores (
      id          TEXT PRIMARY KEY,
      nome        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      perfil      TEXT NOT NULL CHECK(perfil IN ('UTENTE','MEDICO','ADMINISTRADOR')),
      ativo       INTEGER NOT NULL DEFAULT 1,
      criado_em   TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    -- MÉDICOS (extensão de utilizadores)
    CREATE TABLE IF NOT EXISTS medicos (
      id             TEXT PRIMARY KEY REFERENCES utilizadores(id),
      numero_cedula  TEXT NOT NULL UNIQUE,
      especialidade  TEXT NOT NULL
    );

    -- UTENTES (extensão de utilizadores)
    CREATE TABLE IF NOT EXISTS utentes (
      id               TEXT PRIMARY KEY REFERENCES utilizadores(id),
      data_nascimento  TEXT NOT NULL,
      nif              TEXT NOT NULL UNIQUE,
      telefone         TEXT NOT NULL,
      medico_id        TEXT NOT NULL REFERENCES utilizadores(id)
    );

    -- AVALIAÇÕES CARAT
    CREATE TABLE IF NOT EXISTS avaliacoes_carat (
      id                    TEXT PRIMARY KEY,
      utente_id             TEXT REFERENCES utilizadores(id),
      medico_id             TEXT REFERENCES utilizadores(id),
      data                  TEXT NOT NULL,
      respostas             TEXT NOT NULL,  -- JSON array
      score                 INTEGER NOT NULL,
      nivel_controlo        TEXT NOT NULL CHECK(nivel_controlo IN ('CONTROLADA','PARCIALMENTE_CONTROLADA','NAO_CONTROLADA')),
      recomendacoes         TEXT NOT NULL,
      proximo_passo_semanas INTEGER NOT NULL,
      anonima               INTEGER NOT NULL DEFAULT 0,
      criado_em             TEXT NOT NULL
    );

    -- ALERTAS
    CREATE TABLE IF NOT EXISTS alertas (
      id            TEXT PRIMARY KEY,
      utente_id     TEXT NOT NULL REFERENCES utilizadores(id),
      medico_id     TEXT NOT NULL REFERENCES utilizadores(id),
      avaliacao_id  TEXT REFERENCES avaliacoes_carat(id),
      tipo          TEXT NOT NULL CHECK(tipo IN ('SCORE_BAIXO','DETERIORACAO','SINTOMA','MEDICACAO')),
      prioridade    TEXT NOT NULL CHECK(prioridade IN ('BAIXA','MEDIA','ALTA','CRITICA')),
      motivo        TEXT NOT NULL,
      estado        TEXT NOT NULL DEFAULT 'NOVO' CHECK(estado IN ('NOVO','VISTO','EM_SEGUIMENTO','FECHADO')),
      criado_em     TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    -- AÇÕES SOBRE ALERTAS
    CREATE TABLE IF NOT EXISTS alertas_acoes (
      id              TEXT PRIMARY KEY,
      alerta_id       TEXT NOT NULL REFERENCES alertas(id),
      utilizador_id   TEXT NOT NULL REFERENCES utilizadores(id),
      estado_novo     TEXT NOT NULL,
      nota            TEXT NOT NULL,
      data            TEXT NOT NULL
    );

    -- MEDICAÇÃO
    CREATE TABLE IF NOT EXISTS medicacao (
      id                TEXT PRIMARY KEY,
      utente_id         TEXT NOT NULL REFERENCES utilizadores(id),
      medico_id         TEXT NOT NULL REFERENCES utilizadores(id),
      farmaco           TEXT NOT NULL,
      dosagem           TEXT NOT NULL,
      posologia         TEXT NOT NULL,
      data_inicio       TEXT NOT NULL,
      data_fim          TEXT,
      estado            TEXT NOT NULL DEFAULT 'ATIVA' CHECK(estado IN ('ATIVA','INATIVA')),
      motivo_suspensao  TEXT,
      criado_em         TEXT NOT NULL,
      atualizado_em     TEXT NOT NULL
    );

    -- EXAMES
    CREATE TABLE IF NOT EXISTS exames (
      id            TEXT PRIMARY KEY,
      utente_id     TEXT NOT NULL REFERENCES utilizadores(id),
      medico_id     TEXT NOT NULL REFERENCES utilizadores(id),
      tipo          TEXT NOT NULL,
      justificacao  TEXT NOT NULL,
      data          TEXT NOT NULL,
      resultado     TEXT,
      criado_em     TEXT NOT NULL
    );

    -- AUDITORIA
    CREATE TABLE IF NOT EXISTS auditoria (
      id              TEXT PRIMARY KEY,
      utilizador_id   TEXT REFERENCES utilizadores(id),
      acao            TEXT NOT NULL,
      entidade        TEXT NOT NULL,
      entidade_id     TEXT,
      dados           TEXT,
      data            TEXT NOT NULL
    );

    -- LIMIARES DE ALERTA (configurados pelo administrador)
    CREATE TABLE IF NOT EXISTS limiares_alerta (
      id                   TEXT PRIMARY KEY,
      score_minimo         INTEGER NOT NULL DEFAULT 16,
      deterioracao_pontos  INTEGER NOT NULL DEFAULT 4,
      atualizado_em        TEXT NOT NULL
    );

    -- TOKEN DE SESSÃO
    CREATE TABLE IF NOT EXISTS tokens_sessao (
      id              TEXT PRIMARY KEY,
      utilizador_id   TEXT NOT NULL REFERENCES utilizadores(id),
      token           TEXT NOT NULL UNIQUE,
      criado_em       TEXT NOT NULL,
      expira_em       TEXT NOT NULL
    );
  `);
    // Garantir que existe uma configuração de limiares
    const limiar = db.prepare('SELECT id FROM limiares_alerta LIMIT 1').get();
    if (!limiar) {
        db.prepare(`
      INSERT INTO limiares_alerta (id, score_minimo, deterioracao_pontos, atualizado_em)
      VALUES ('limiar-default', 16, 4, ?)
    `).run(new Date().toISOString());
    }
}

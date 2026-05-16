PRAGMA foreign_keys = ON;


-- UTILIZADOR
-- perfil: 1=UTENTE, 2=MEDICO, 3=ADMINISTRADOR

CREATE TABLE IF NOT EXISTS utilizador (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    perfil        INTEGER NOT NULL CHECK (perfil IN (1, 2, 3)),
    ativo         INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    data_criacao  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------------
-- MEDICO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medico (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utilizador INTEGER NOT NULL UNIQUE,
    nome_medico   TEXT    NOT NULL,
    especialidade TEXT    NOT NULL,
    telemovel     TEXT,
    ativo         INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    FOREIGN KEY (id_utilizador) REFERENCES utilizador(id)
);

-- -------------------------------------------------------------
-- UTENTE
-- motivo_remocao: 1=FALECIDO, 2=PEDIDO_UTENTE, 3=DUPLICADO, 4=OUTRO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utente (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utilizador   INTEGER NOT NULL UNIQUE,
    id_medico       INTEGER NOT NULL,
    num_utente      TEXT    NOT NULL UNIQUE,
    nome_utente     TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    telemovel       TEXT,
    morada          TEXT,
    data_nascimento TEXT,
    estado_civil    TEXT,
    alergias        TEXT,
    nif             TEXT    NOT NULL UNIQUE,
    ativo           INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    motivo_remocao  INTEGER          CHECK (motivo_remocao IN (1, 2, 3, 4)),
    data_remocao    TEXT,
    FOREIGN KEY (id_utilizador) REFERENCES utilizador(id),
    FOREIGN KEY (id_medico)     REFERENCES medico(id)
);

-- -------------------------------------------------------------
-- ADMINISTRADOR
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrador (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utilizador INTEGER NOT NULL UNIQUE,
    nome          TEXT    NOT NULL,
    FOREIGN KEY (id_utilizador) REFERENCES utilizador(id)
);

-- -------------------------------------------------------------
-- TOKEN_SESSAO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_sessao (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utilizador INTEGER NOT NULL,
    token_hash    TEXT    NOT NULL UNIQUE,
    expira_em     TEXT    NOT NULL,
    revogado      INTEGER NOT NULL DEFAULT 0 CHECK (revogado IN (0, 1)),
    ip_address    TEXT,
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (id_utilizador) REFERENCES utilizador(id)
);

-- -------------------------------------------------------------
-- AUDITORIA
-- acao: LOGIN, LOGOUT, CREATE, READ, UPDATE, DELETE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utilizador INTEGER NOT NULL,
    entidade      TEXT    NOT NULL,
    entidade_id   INTEGER,
    acao          TEXT    NOT NULL CHECK (acao IN ('LOGIN','LOGOUT','CREATE','READ','UPDATE','DELETE')),
    data          TEXT    NOT NULL DEFAULT (datetime('now')),
    dado_novo     TEXT,
    dado_anterior TEXT,
    FOREIGN KEY (id_utilizador) REFERENCES utilizador(id)
);

-- -------------------------------------------------------------
-- CONFIGURACAO (limiares de alerta, gerida pelo administrador)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuracao (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    id_admin           INTEGER NOT NULL,
    parametro          TEXT    NOT NULL,
    valor_minimo       INTEGER NOT NULL,
    valor_maximo       INTEGER NOT NULL,
    delta_deterioracao INTEGER NOT NULL DEFAULT 3,
    FOREIGN KEY (id_admin) REFERENCES administrador(id)
);
   -- Restrições de validação de dados
    CHECK (valor_minimo > 0),
    CHECK (valor_maximo > 0),
    CHECK (valor_minimo < valor_maximo)
    Delta positivo para evitar alertas infinitos ou nulos
    CHECK (delta_deterioracao > 0),

-- -------------------------------------------------------------
-- PRESCRICAO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescricao (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utente        INTEGER NOT NULL,
    id_medico        INTEGER NOT NULL,
    data_prescricao  TEXT    NOT NULL DEFAULT (datetime('now')),
    assinatura       TEXT,
    nr_embalagem     INTEGER,
    FOREIGN KEY (id_utente) REFERENCES utente(id),
    FOREIGN KEY (id_medico) REFERENCES medico(id)
);

-- -------------------------------------------------------------
-- MEDICACAO
-- ativo: 0=INATIVO (soft delete, mantido por auditoria clínica)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicacao (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prescricao    INTEGER NOT NULL,
    farmaco          TEXT    NOT NULL,
    dosagem          TEXT    NOT NULL,
    posologia        TEXT    NOT NULL,
    data_inicio      TEXT    NOT NULL,
    data_fim         TEXT,
    motivo_remocao   TEXT,
    ativo            INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    FOREIGN KEY (id_prescricao) REFERENCES prescricao(id)
);

-- -------------------------------------------------------------
-- EXAME
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exame (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prescricao         INTEGER NOT NULL,
    tipo_exame            TEXT    NOT NULL,
    justificacao_clinica  TEXT,
    data_realizacao       TEXT,
    resultado             TEXT,
    FOREIGN KEY (id_prescricao) REFERENCES prescricao(id)
);

-- -------------------------------------------------------------
-- SINTOMA
-- gravidade: LEVE, MODERADO, GRAVE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sintoma (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utente    INTEGER NOT NULL,
    descricao    TEXT    NOT NULL,
    data_registo TEXT    NOT NULL DEFAULT (date('now')),
    gravidade    TEXT    NOT NULL CHECK (gravidade IN ('LEVE','MODERADO','GRAVE')),
    FOREIGN KEY (id_utente) REFERENCES utente(id)
);

-- -------------------------------------------------------------
-- PERGUNTA_CARAT (seed fixo - 10 perguntas)
-- subescala: RINITE (1-6), ASMA (7-10)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pergunta_carat (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    texto     TEXT    NOT NULL,
    subescala TEXT    NOT NULL CHECK (subescala IN ('RINITE','ASMA')),
    opcao0    TEXT    NOT NULL,
    opcao1    TEXT    NOT NULL,
    opcao2    TEXT    NOT NULL,
    opcao3    TEXT    NOT NULL,
    ordem     INTEGER NOT NULL UNIQUE
);

-- -------------------------------------------------------------
-- AVALIACAO_CARAT
-- recomendacao: marcar_consulta, tomar_med_sos_marcar_consulta, estavel
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS avaliacao_carat (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utente      INTEGER NOT NULL,
    data_avaliacao TEXT    NOT NULL DEFAULT (datetime('now')),
    score_total    INTEGER NOT NULL,
    score_rinite   INTEGER NOT NULL,
    score_asma     INTEGER NOT NULL,
    ctrl_total     INTEGER NOT NULL CHECK (ctrl_total  IN (0, 1)),
    ctrl_rinite    INTEGER NOT NULL CHECK (ctrl_rinite IN (0, 1)),
    ctrl_asma      INTEGER NOT NULL CHECK (ctrl_asma   IN (0, 1)),
    recomendacao   TEXT    NOT NULL CHECK (recomendacao IN (
                       'marcar_consulta',
                       'tomar_med_sos_marcar_consulta',
                       'estavel'
                   )),
    prox_avaliacao TEXT,
    FOREIGN KEY (id_utente) REFERENCES utente(id)
);

-- -------------------------------------------------------------
-- RESPOSTA_CARAT
-- valorResposta: 0-3 (correspondente às opções da pergunta)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resposta_carat (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_avaliacao  INTEGER NOT NULL,
    id_pergunta   INTEGER NOT NULL,
    valor_resposta INTEGER NOT NULL CHECK (valor_resposta BETWEEN 0 AND 3),
    UNIQUE (id_avaliacao, id_pergunta),
    FOREIGN KEY (id_avaliacao) REFERENCES avaliacao_carat(id),
    FOREIGN KEY (id_pergunta)  REFERENCES pergunta_carat(id)
);

-- -------------------------------------------------------------
-- ALERTA
-- tipo    : SCORE_BAIXO, DETERIORACAO, SINTOMA, MEDICACAO
-- prioridade: BAIXA, MEDIA, ALTA, CRITICA
-- estado  : NOVO, VISTO, EM_SEGUIMENTO, FECHADO
-- id_avaliacao e id_sintoma são nullable (FK opcional)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerta (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_utente    INTEGER NOT NULL,
    id_avaliacao INTEGER,
    id_sintoma   INTEGER,
    tipo         TEXT    NOT NULL CHECK (tipo      IN ('SCORE_BAIXO','DETERIORACAO','SINTOMA','MEDICACAO')),
    prioridade   TEXT    NOT NULL CHECK (prioridade IN ('BAIXA','MEDIA','ALTA','CRITICA')),
    estado       TEXT    NOT NULL DEFAULT 'NOVO' CHECK (estado IN ('NOVO','VISTO','EM_SEGUIMENTO','FECHADO')),
    FOREIGN KEY (id_utente)    REFERENCES utente(id),
    FOREIGN KEY (id_avaliacao) REFERENCES avaliacao_carat(id),
    FOREIGN KEY (id_sintoma)   REFERENCES sintoma(id)
);

-- -------------------------------------------------------------
-- ALERTA_ACAO (log imutável de transições do ciclo de vida)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerta_acao (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_alerta       INTEGER NOT NULL,
    estado_anterior TEXT    NOT NULL CHECK (estado_anterior IN ('NOVO','VISTO','EM_SEGUIMENTO','FECHADO')),
    estado_novo     TEXT    NOT NULL CHECK (estado_novo     IN ('NOVO','VISTO','EM_SEGUIMENTO','FECHADO')),
    nota            TEXT    NOT NULL,
    alterado        TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (id_alerta) REFERENCES alerta(id)
);

-- =============================================================
-- ÍNDICES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_utente_medico       ON utente(id_medico);
CREATE INDEX IF NOT EXISTS idx_token_utilizador    ON token_sessao(id_utilizador);
CREATE INDEX IF NOT EXISTS idx_auditoria_utilizador ON auditoria(id_utilizador);
CREATE INDEX IF NOT EXISTS idx_avaliacao_utente    ON avaliacao_carat(id_utente);
CREATE INDEX IF NOT EXISTS idx_resposta_avaliacao  ON resposta_carat(id_avaliacao);
CREATE INDEX IF NOT EXISTS idx_alerta_utente       ON alerta(id_utente);
CREATE INDEX IF NOT EXISTS idx_alerta_estado       ON alerta(estado);
CREATE INDEX IF NOT EXISTS idx_prescricao_utente   ON prescricao(id_utente);
CREATE INDEX IF NOT EXISTS idx_sintoma_utente      ON sintoma(id_utente);

-- =============================================================
-- SEED - PERGUNTAS CARAT (10 perguntas fixas)
-- Subescala RINITE: perguntas 1 a 6
-- Subescala ASMA  : perguntas 7 a 10
-- Pontuação: 0 = Sempre, 1 = Muitas vezes, 2 = Algumas vezes, 3 = Nunca
-- =============================================================
INSERT OR IGNORE INTO pergunta_carat (id, texto, subescala, opcao0, opcao1, opcao2, opcao3, ordem) VALUES
(1,  'Nas últimas 4 semanas, teve problemas para dormir devido aos seus sintomas nasais?',
     'RINITE', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 1),
(2,  'Nas últimas 4 semanas, teve sintomas nasais (escorrimento, obstrução, espirros) durante o dia?',
     'RINITE', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 2),
(3,  'Nas últimas 4 semanas, os seus sintomas nasais perturbaram as suas atividades diárias?',
     'RINITE', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 3),
(4,  'Nas últimas 4 semanas, teve sintomas oculares (comichão, lacrimejo, vermelhidão)?',
     'RINITE', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 4),
(5,  'Nas últimas 4 semanas, classificaria os seus sintomas nasais como?',
     'RINITE', 'Muito graves', 'Graves', 'Moderados', 'Ligeiros ou nenhuns', 5),
(6,  'Nas últimas 4 semanas, o tratamento para a rinite foi eficaz?',
     'RINITE', 'Nada eficaz', 'Pouco eficaz', 'Eficaz', 'Muito eficaz', 6),
(7,  'Nas últimas 4 semanas, teve problemas para dormir devido à sua asma?',
     'ASMA', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 7),
(8,  'Nas últimas 4 semanas, teve sintomas de asma durante o dia (pieira, falta de ar, aperto no peito)?',
     'ASMA', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 8),
(9,  'Nas últimas 4 semanas, a sua asma limitou as suas atividades físicas ou desportivas?',
     'ASMA', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 9),
(10, 'Nas últimas 4 semanas, usou medicação de alívio (broncodilatador) para a sua asma?',
     'ASMA', 'Sempre', 'Muitas vezes', 'Algumas vezes', 'Nunca', 10);

-- =============================================================
-- SEED - DADOS SIMULADOS
-- =============================================================

-- Utilizadores base
INSERT OR IGNORE INTO utilizador (id, email, password_hash, perfil, ativo) VALUES
(1, 'admin@saudinob.pt',   'hash_admin',   3, 1),
(2, 'drsilva@saudinob.pt', 'hash_medico1', 2, 1),
(3, 'drfaria@saudinob.pt', 'hash_medico2', 2, 1),
(4, 'joao.silva@email.pt', 'hash_utente1', 1, 1),
(5, 'maria.costa@email.pt','hash_utente2', 1, 1),
(6, 'rui.matos@email.pt',  'hash_utente3', 1, 1);

-- Administrador
INSERT OR IGNORE INTO administrador (id, id_utilizador, nome) VALUES
(1, 1, 'Administrador SAUDINOB');

-- Médicos
INSERT OR IGNORE INTO medico (id, id_utilizador, nome_medico, especialidade, telemovel, ativo) VALUES
(1, 2, 'Dr. António Silva', 'Pneumologia',   '912000001', 1),
(2, 3, 'Dra. Carla Faria',  'Imunoalergologia', '912000002', 1);

-- Utentes
INSERT OR IGNORE INTO utente (id, id_utilizador, id_medico, nif, nome_utente, email, telemovel, morada, data_nascimento, estado_civil, ativo) VALUES
(1, 4, 1, '123456789', 'João Silva',  'joao.silva@email.pt',  '931000001', 'Rua das Flores 10, Porto',   '1985-03-15', 'Casado',   1),
(2, 5, 1, '234567890', 'Maria Costa', 'maria.costa@email.pt', '931000002', 'Av. da Liberdade 5, Lisboa', '1990-07-22', 'Solteira', 1),
(3, 6, 2, '345678901', 'Rui Matos',   'rui.matos@email.pt',   '931000003', 'Rua do Almada 3, Porto',     '1978-11-30', 'Casado',   1);

-- Configuração de limiares
INSERT OR IGNORE INTO configuracao (id, id_admin, parametro, valor_minimo, valor_maximo, delta_deterioracao) VALUES
(1, 1, 'LIMIAR_CARAT_RINITE', 0, 8,  3),
(2, 1, 'LIMIAR_CARAT_ASMA',   0, 5,  2),
(3, 1, 'LIMIAR_CARAT_TOTAL',  0, 12, 4);

-- Avaliações CARAT
INSERT OR IGNORE INTO avaliacao_carat (id, id_utente, data_avaliacao, score_total, score_rinite, score_asma, ctrl_total, ctrl_rinite, ctrl_asma, recomendacao, prox_avaliacao) VALUES
(1, 1, '2026-02-01 10:00:00', 18, 10, 8, 0, 0, 0, 'marcar_consulta',              '2026-03-01'),
(2, 1, '2026-03-05 10:00:00', 22, 13, 9, 0, 0, 0, 'marcar_consulta',              '2026-04-05'),
(3, 1, '2026-04-10 10:00:00', 26, 15, 11, 1, 1, 1, 'estavel',                     '2026-07-10'),
(4, 2, '2026-03-10 11:00:00',  8,  5,  3, 0, 0, 0, 'tomar_med_sos_marcar_consulta','2026-04-10'),
(5, 3, '2026-04-01 09:00:00', 20, 11,  9, 0, 0, 0, 'marcar_consulta',              '2026-05-01');

-- Respostas CARAT (avaliação 1 - João Silva)
INSERT OR IGNORE INTO resposta_carat (id_avaliacao, id_pergunta, valor_resposta) VALUES
(1,1,0),(1,2,0),(1,3,1),(1,4,1),(1,5,0),(1,6,2),
(1,7,1),(1,8,0),(1,9,1),(1,10,0);

-- Respostas CARAT (avaliação 4 - Maria Costa)
INSERT OR IGNORE INTO resposta_carat (id_avaliacao, id_pergunta, valor_resposta) VALUES
(4,1,2),(4,2,1),(4,3,2),(4,4,3),(4,5,1),(4,6,2),
(4,7,2),(4,8,1),(4,9,2),(4,10,2);

-- Sintomas
INSERT OR IGNORE INTO sintoma (id, id_utente, descricao, data_registo, gravidade) VALUES
(1, 1, 'Pieira intensa ao acordar',       '2026-02-10', 'GRAVE'),
(2, 2, 'Obstrução nasal persistente',      '2026-03-12', 'MODERADO'),
(3, 3, 'Falta de ar após esforço físico', '2026-04-02', 'MODERADO');

-- Prescrições
INSERT OR IGNORE INTO prescricao (id, id_utente, id_medico, data_prescricao, assinatura) VALUES
(1, 1, 1, '2026-02-15 14:00:00', 'Dr. António Silva - OM 12345'),
(2, 2, 1, '2026-03-15 10:30:00', 'Dr. António Silva - OM 12345'),
(3, 3, 2, '2026-04-05 09:00:00', 'Dra. Carla Faria  - OM 67890');

-- Medicação
INSERT OR IGNORE INTO medicacao (id_prescricao, farmaco, dosagem, posologia, data_inicio, data_fim, ativo) VALUES
(1, 'Fluticasona',    '50mcg',  '2x/dia nasal',           '2026-02-15', NULL,         1),
(1, 'Salbutamol',     '100mcg', 'SOS (máx 4x/dia)',       '2026-02-15', NULL,         1),
(2, 'Montelucaste',   '10mg',   '1x/dia ao deitar',       '2026-03-15', NULL,         1),
(3, 'Budesonida',     '200mcg', '2x/dia inalatório',      '2026-04-05', NULL,         1),
(3, 'Formoterol',     '12mcg',  '2x/dia inalatório',      '2026-04-05', NULL,         1);

-- Exames
INSERT OR IGNORE INTO exame (id_prescricao, tipo_exame, justificacao_clinica, data_realizacao, resultado) VALUES
(1, 'Espirometria',        'Avaliação função pulmonar',       '2026-03-01', 'FEV1/FVC = 68% - obstrutivo ligeiro'),
(2, 'Teste Picada Cutânea','Identificação alergénios',        '2026-04-01',  NULL),
(3, 'Radiografia Tórax',   'Exclusão patologia associada',    NULL,          NULL);

-- Alertas
INSERT OR IGNORE INTO alerta (id, id_utente, id_avaliacao, id_sintoma, tipo, prioridade, estado) VALUES
(1, 1, 1, NULL, 'SCORE_BAIXO',  'ALTA',   'FECHADO'),
(2, 1, 2, NULL, 'DETERIORACAO', 'CRITICA','EM_SEGUIMENTO'),
(3, 2, 4, NULL, 'SCORE_BAIXO',  'MEDIA',  'VISTO'),
(4, 3, 5, NULL, 'SCORE_BAIXO',  'ALTA',   'NOVO'),
(5, 1, NULL, 1, 'SINTOMA',      'CRITICA','FECHADO');

-- Log de transições dos alertas (ALERTA_ACAO)
INSERT OR IGNORE INTO alerta_acao (id_alerta, estado_anterior, estado_novo, nota, alterado) VALUES
(1, 'NOVO',         'VISTO',        'Alerta revisto em consulta.',                           '2026-02-16 09:00:00'),
(1, 'VISTO',        'EM_SEGUIMENTO','Medicação ajustada. Aguardar reavaliação em 4 semanas.','2026-02-16 09:30:00'),
(1, 'EM_SEGUIMENTO','FECHADO',      'Score melhorou. Situação controlada.',                  '2026-03-06 10:00:00'),
(2, 'NOVO',         'VISTO',        'Deterioração confirmada. Consulta urgente agendada.',   '2026-03-06 10:05:00'),
(2, 'VISTO',        'EM_SEGUIMENTO','Terapêutica reforçada. Monitorização semanal.',         '2026-03-06 10:30:00'),
(3, 'NOVO',         'VISTO',        'Analisado. Score baixo mas estável.',                   '2026-03-11 14:00:00'),
(5, 'NOVO',         'VISTO',        'Sintoma comunicado ao médico.',                         '2026-02-11 08:00:00'),
(5, 'VISTO',        'EM_SEGUIMENTO','Medicação de alívio prescrita.',                        '2026-02-15 14:00:00'),
(5, 'EM_SEGUIMENTO','FECHADO',      'Pieira resolvida após início de terapêutica.',           '2026-03-01 10:00:00');

-- Medicacoes
db.exec(`
  CREATE TABLE IF NOT EXISTS medicacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    medico_nome TEXT NOT NULL,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
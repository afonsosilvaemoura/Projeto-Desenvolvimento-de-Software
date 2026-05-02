"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registarAuditoria = registarAuditoria;
const db_1 = require("../database/db");
const uuid_1 = require("uuid");
function registarAuditoria(utilizadorId, acao, entidade, entidadeId, dados) {
    const db = (0, db_1.getDb)();
    db.prepare(`
    INSERT INTO auditoria (id, utilizador_id, acao, entidade, entidade_id, dados, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), utilizadorId, acao, entidade, entidadeId ?? null, dados ? JSON.stringify(dados) : null, new Date().toISOString());
}

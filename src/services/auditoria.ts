import { getDb } from '../database/db';
import { v4 as uuidv4 } from 'uuid';

export function registarAuditoria(
  utilizadorId: string | null,
  acao: string,
  entidade: string,
  entidadeId?: string | null,
  dados?: object | null
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO auditoria (id, utilizador_id, acao, entidade, entidade_id, dados, data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    utilizadorId,
    acao,
    entidade,
    entidadeId ?? null,
    dados ? JSON.stringify(dados) : null,
    new Date().toISOString()
  );
}

/*import { getDb } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

export function registarAuditoria(
  utilizadorId: string | null,
  acao: string,
  entidade: string,
  entidadeId: string | null,
  dados: any = null
): void {
  try {
    const db = getDb();
    const id = uuidv4();
    const data = new Date().toISOString();
    const dadosJson = dados ? JSON.stringify(dados) : null;

    db.prepare(`
      INSERT INTO auditoria (id, utilizador_id, acao, entidade, entidade_id, dados, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, utilizadorId, acao, entidade, entidadeId, dadosJson, data);
  } catch (error) {
    console.error('Erro ao registar auditoria:', error);
  }
}*/

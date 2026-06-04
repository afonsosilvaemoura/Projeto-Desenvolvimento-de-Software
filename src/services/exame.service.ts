import { db } from '../database/database';

export class ExameService {
  criarExame(dados: { utente_id: number; tipo_exame: string; exame: string; medico_id?: number | null; data_marcacao: string }) {
    const result = db.prepare(
      'INSERT INTO exame (utente_id, tipo_exame, exame, medico_id, data_marcacao, data_criacao) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(dados.utente_id, dados.tipo_exame, dados.exame, dados.medico_id ?? null, dados.data_marcacao, new Date().toISOString());

    return db.prepare('SELECT * FROM exame WHERE id = ?').get(result.lastInsertRowid);
  }

  listarExames() {
    return db.prepare(`
      SELECT e.*, u.nome as utente_nome, m.nome as medico_nome
      FROM exame e
      LEFT JOIN utente u ON e.utente_id = u.id
      LEFT JOIN medico m ON e.medico_id = m.id
      ORDER BY e.data_criacao DESC
    `).all();
  }

  listarExamesParaUtente(utenteId: number) {
    return db.prepare(`
      SELECT e.*, u.nome as utente_nome, m.nome as medico_nome
      FROM exame e
      LEFT JOIN utente u ON e.utente_id = u.id
      LEFT JOIN medico m ON e.medico_id = m.id
      WHERE e.utente_id = ?
      ORDER BY e.data_criacao DESC
    `).all(utenteId);
  }

  listarExamesParaMedico(medicoId: number) {
    return db.prepare(`
      SELECT e.*, u.nome as utente_nome, m.nome as medico_nome
      FROM exame e
      JOIN utente u ON e.utente_id = u.id
      LEFT JOIN medico m ON e.medico_id = m.id
      WHERE u.medico_id = ?
      ORDER BY e.data_criacao DESC
    `).all(medicoId);
  }
}

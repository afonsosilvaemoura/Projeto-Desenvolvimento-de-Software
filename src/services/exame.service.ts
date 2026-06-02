import { db } from '../database/database';

export class ExameService {
  criarExame(dados: { utente_id: number; tipo_exame: string; exame: string; medico_id?: number | null; data_marcacao: string }) {
    const result = db.prepare(
      'INSERT INTO exame (utente_id, tipo_exame, exame, medico_id, data_marcacao, data_criacao) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(dados.utente_id, dados.tipo_exame, dados.exame, dados.medico_id ?? null, dados.data_marcacao, new Date().toISOString());

    return db.prepare('SELECT * FROM exame WHERE id = ?').get(result.lastInsertRowid);
  }

  listarExames() {
    return db.prepare('SELECT * FROM exame ORDER BY data_criacao DESC').all();
  }

  listarExamesParaUtente(utenteId: number) {
    return db.prepare('SELECT * FROM exame WHERE utente_id = ? ORDER BY data_criacao DESC').all(utenteId);
  }
}

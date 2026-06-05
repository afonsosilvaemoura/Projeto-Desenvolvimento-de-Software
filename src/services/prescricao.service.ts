import { db } from '../database/database';
import { Prescricao } from '../models';

export class PrescricaoService {
  criarPrescricaoDTO(dados: { utente_id: number; medico_nome: string; farmaco: string; dosagem: string; posologia: string; embalagens_total?: number }) {
    const jaExiste = db.prepare(
      'SELECT id FROM prescricao WHERE utente_id=? AND farmaco=? AND dosagem=? AND medico_nome=? AND posologia=?'
    ).get(dados.utente_id, dados.farmaco, dados.dosagem, dados.medico_nome, dados.posologia);

    if (jaExiste) throw new Error('Já existe uma prescrição com os mesmos dados registada no sistema.');

    const result = db.prepare(
      'INSERT INTO prescricao (utente_id, medico_nome, farmaco, dosagem, posologia, embalagens_total, data_criacao) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(dados.utente_id, dados.medico_nome, dados.farmaco, dados.dosagem, dados.posologia, dados.embalagens_total || 0, new Date().toISOString());

    return db.prepare('SELECT * FROM prescricao WHERE id = ?').get(result.lastInsertRowid);
  }

  listarPrescricoesComDTO(): Prescricao[] {
    return db.prepare(`
      SELECT p.*, u.nome as utente_nome
      FROM prescricao p LEFT JOIN utente u ON p.utente_id = u.id
      ORDER BY p.data_criacao DESC
    `).all() as Prescricao[];
  }

  listarPrescricoesParaMedico(medicoId: number): Prescricao[] {
    return db.prepare(`
      SELECT p.*, u.nome as utente_nome
      FROM prescricao p JOIN utente u ON p.utente_id = u.id
      WHERE u.medico_id = ?
      ORDER BY p.data_criacao DESC
    `).all(medicoId) as Prescricao[];
  }

  listarPrescricoesComDTOParaUtente(utenteId: number): Prescricao[] {
    return db.prepare(`
      SELECT p.*, u.nome as utente_nome
      FROM prescricao p LEFT JOIN utente u ON p.utente_id = u.id
      WHERE p.utente_id = ?
      ORDER BY p.data_criacao DESC
    `).all(utenteId) as Prescricao[];
  }
}

import { db } from '../database/database';

export class PrescricaoService {
  criarPrescricaoDTO(dados: { utente_id: number; medico_nome: string; farmaco: string; dosagem: string; posologia: string }) {
    const jaExiste = db.prepare(
      'SELECT id FROM prescricao WHERE utente_id=? AND farmaco=? AND dosagem=? AND medico_nome=? AND posologia=?'
    ).get(dados.utente_id, dados.farmaco, dados.dosagem, dados.medico_nome, dados.posologia);

    if (jaExiste) throw new Error('Já existe uma prescrição com os mesmos dados registada no sistema.');

    const result = db.prepare(
      'INSERT INTO prescricao (utente_id, medico_nome, farmaco, dosagem, posologia, data_criacao) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(dados.utente_id, dados.medico_nome, dados.farmaco, dados.dosagem, dados.posologia, new Date().toISOString());

    return db.prepare('SELECT * FROM prescricao WHERE id = ?').get(result.lastInsertRowid);
  }

  listarPrescricoesComDTO() {
    return db.prepare('SELECT * FROM prescricao ORDER BY data_criacao DESC').all();
  }

  listarPrescricoesComDTOParaUtente(utenteId: number) {
    return db.prepare('SELECT * FROM prescricao WHERE utente_id = ? ORDER BY data_criacao DESC').all(utenteId);
  }
}

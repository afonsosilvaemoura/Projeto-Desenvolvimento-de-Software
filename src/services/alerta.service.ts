import { db } from '../database/database';

export class AlertaService {

  getAlertasMedico(medicoId: number) {
    const utentes = db.prepare('SELECT id FROM utente WHERE medico_id = ? AND ativo = 1').all(medicoId) as any[];
    if (!utentes.length) return [];
    const ph = utentes.map(() => '?').join(',');
    return db.prepare(`
      SELECT a.id, a.utente_id, a.tipo, a.prioridade, a.motivo, a.estado, a.dataCriacao,
             u.nome as utente_nome,
             (SELECT scoreTotal FROM avaliacao_carat WHERE utente_id = a.utente_id ORDER BY dataCriacao DESC LIMIT 1) as ultimo_score
      FROM alerta a JOIN utente u ON a.utente_id = u.id
      WHERE a.utente_id IN (${ph}) AND a.estado IN ('NOVO', 'EM_SEGUIMENTO')
      ORDER BY CASE a.prioridade WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 ELSE 3 END, a.dataCriacao DESC
    `).all(...utentes.map(u => u.id));
  }

  updateEstado(alertaId: number, medicoId: number, estado: string) {
    const validos = ['EM_SEGUIMENTO', 'FECHADO'];
    if (!validos.includes(estado)) throw new Error('Estado inválido. Use EM_SEGUIMENTO ou FECHADO.');
    const alerta = db.prepare(`
      SELECT a.id FROM alerta a JOIN utente u ON a.utente_id = u.id
      WHERE a.id = ? AND u.medico_id = ?
    `).get(alertaId, medicoId);
    if (!alerta) throw new Error('Alerta não encontrado.');
    db.prepare('UPDATE alerta SET estado = ?, dataAtualizacao = ? WHERE id = ?')
      .run(estado, new Date().toISOString(), alertaId);
  }

  getAllAlertas() {
    return db.prepare('SELECT * FROM alerta ORDER BY dataCriacao DESC').all();
  }

  getLimiar() {
    let limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() as any;
    if (!limiar) {
      db.prepare('INSERT INTO limiar_alerta (scoreMinimo, deterioracaoPontos, dataAtualizacao) VALUES (24, 3, ?)').run(new Date().toISOString());
      limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get();
    }
    return limiar;
  }

  updateLimiar(scoreMinimo: number, deterioracaoPontos: number) {
    const now = new Date().toISOString();
    const limiar = db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get() as any;
    if (!limiar) {
      db.prepare('INSERT INTO limiar_alerta (scoreMinimo, deterioracaoPontos, dataAtualizacao) VALUES (?, ?, ?)').run(scoreMinimo, deterioracaoPontos, now);
    } else {
      db.prepare('UPDATE limiar_alerta SET scoreMinimo=?, deterioracaoPontos=?, dataAtualizacao=? WHERE id=?').run(scoreMinimo, deterioracaoPontos, now, limiar.id);
    }
    return db.prepare('SELECT * FROM limiar_alerta ORDER BY id LIMIT 1').get();
  }
}

import { db } from '../database/database';
import { AlertaService } from './alerta.service';

const alertaService = new AlertaService();

export class DashboardService {

  getDashboardUtente(userId: number) {
    const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(userId) as any;
    if (!utente) return null;

    const avaliacoes = db.prepare(
      'SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC'
    ).all(userId) as any[];

    const alertas = db.prepare(
      "SELECT * FROM alerta WHERE utente_id = ? AND estado != 'FECHADO' ORDER BY dataCriacao DESC"
    ).all(userId);

    const exames = db.prepare(
      'SELECT * FROM exame WHERE utente_id = ? ORDER BY data_criacao DESC'
    ).all(userId);

    const ultimoCarat = avaliacoes[0] ?? null;

    return {
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        diagnostico_asma: !!utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta,
        medico_id: utente.medico_id,
      },
      carats: avaliacoes.map(c => ({
        id: c.id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma, controloTotal: c.nivelControlo,
        recomendacao: c.recomendacao, proximoPassoSemanas: c.proximoPassoSemanas,
        dataCriacao: c.dataCriacao,
      })),
      exames,
      alertas,
      ultimoCarat: ultimoCarat ? {
        id: ultimoCarat.id, scoreTotal: ultimoCarat.scoreTotal,
        scoreRinite: ultimoCarat.scoreRinite, scoreAsma: ultimoCarat.scoreAsma,
        controloTotal: ultimoCarat.nivelControlo, recomendacao: ultimoCarat.recomendacao,
        proximoPassoSemanas: ultimoCarat.proximoPassoSemanas, dataCriacao: ultimoCarat.dataCriacao,
      } : null,
      totalExames: (exames as any[]).length,
      totalCarats: avaliacoes.length,
    };
  }

  getAlertasMedico(medicoId: number) {
    return alertaService.getAlertasMedico(medicoId);
  }

  getDashboardMedico(medicoId: number) {
    const utentes = db.prepare(
      'SELECT id, nome, username, sexo, idade, medico_id FROM utente WHERE medico_id = ?'
    ).all(medicoId) as any[];

    let alertas: any[] = [];
    if (utentes.length) {
      const ph = utentes.map(() => '?').join(',');
      alertas = db.prepare(
        `SELECT * FROM alerta WHERE utente_id IN (${ph}) AND estado != 'FECHADO' ORDER BY dataCriacao DESC`
      ).all(...utentes.map(u => u.id));
    }

    return { utentes, alertas };
  }

  getEstatisticasAdmin() {
    return {
      utentes:    (db.prepare('SELECT COUNT(*) as c FROM utente').get() as any).c,
      medicos:    (db.prepare('SELECT COUNT(*) as c FROM medico').get() as any).c,
      avaliacoes: (db.prepare('SELECT COUNT(*) as c FROM avaliacao_carat').get() as any).c,
      alertas:    (db.prepare("SELECT COUNT(*) as c FROM alerta WHERE estado != 'FECHADO'").get() as any).c,
    };
  }

  getDashboardAdmin(utenteId: number) {
    const utente = db.prepare('SELECT * FROM utente WHERE id = ?').get(utenteId) as any;
    if (!utente) return null;

    const carats = db.prepare(
      'SELECT * FROM avaliacao_carat WHERE utente_id = ? ORDER BY dataCriacao DESC'
    ).all(utenteId) as any[];

    const exames = db.prepare(`
      SELECT e.*, m.nome as medico_nome FROM exame e
      LEFT JOIN medico m ON e.medico_id = m.id
      WHERE e.utente_id = ?
    `).all(utenteId);

    const prescricoes = db.prepare(
      'SELECT * FROM prescricao WHERE utente_id = ? ORDER BY data_criacao DESC'
    ).all(utenteId);

    const ultimoCarat = carats[0] ?? null;

    return {
      utente: {
        id: utente.id, nome: utente.nome, sexo: utente.sexo, idade: utente.idade,
        data_nascimento: utente.data_nascimento,
        diagnostico_asma: !!utente.diagnostico_asma,
        data_primeira_consulta: utente.data_primeira_consulta, medico_id: utente.medico_id,
      },
      carats: carats.map(c => ({
        id: c.id, scoreTotal: c.scoreTotal, scoreRinite: c.scoreRinite,
        scoreAsma: c.scoreAsma, controloTotal: c.nivelControlo, dataCriacao: c.dataCriacao,
      })),
      exames, prescricoes,
      ultimoCarat: ultimoCarat ? {
        scoreTotal: ultimoCarat.scoreTotal, scoreRinite: ultimoCarat.scoreRinite,
        scoreAsma: ultimoCarat.scoreAsma, controloTotal: ultimoCarat.nivelControlo,
      } : null,
      totalExames: (exames as any[]).length,
      totalCarats: carats.length,
      alertasAtivos: (db.prepare("SELECT COUNT(*) as c FROM alerta WHERE utente_id = ? AND estado = 'NOVO'").get(utenteId) as any).c,
      medicacoesAtivas: (db.prepare('SELECT COUNT(*) as c FROM prescricao WHERE utente_id = ? AND ativo = 1').get(utenteId) as any).c,
    };
  }
}

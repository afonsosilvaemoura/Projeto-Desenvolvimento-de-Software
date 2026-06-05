import bcrypt from 'bcryptjs';
import { db } from '../database/database';
import { Utente, Medico } from '../models';

export class AdminService {

  listarMedicos(): Medico[] {
    return db.prepare(
      'SELECT id, nome, username, especialidade, numero_cedula, ativo, dataCriacao FROM medico ORDER BY nome ASC'
    ).all() as Medico[];
  }

  toggleMedico(id: number, ativo: boolean) {
    if (!db.prepare('SELECT id FROM medico WHERE id = ?').get(id))
      throw new Error('Médico não encontrado.');
    db.prepare('UPDATE medico SET ativo = ?, dataAtualizacao = ? WHERE id = ?')
      .run(ativo ? 1 : 0, new Date().toISOString(), id);
  }

  listarUtentes(): Utente[] {
    return db.prepare(`
      SELECT u.id, u.nome, u.username, u.sexo, u.idade, u.ativo, u.motivo_inativacao,
             u.medico_id, m.nome as medico_nome
      FROM utente u LEFT JOIN medico m ON u.medico_id = m.id
      ORDER BY u.nome ASC
    `).all() as Utente[];
  }

  toggleUtente(id: number, ativo: boolean, adminId: number, password: string, motivo?: string) {
    if (!ativo) {
      if (!password) throw new Error('Password é obrigatória para inativar.');
      const admin = db.prepare('SELECT * FROM administrador WHERE id = ?').get(adminId) as any;
      if (!admin || !bcrypt.compareSync(password, admin.password_hash))
        throw new Error('Password incorreta.');
    }
    if (!db.prepare('SELECT id FROM utente WHERE id = ?').get(id))
      throw new Error('Utente não encontrado.');
    db.prepare('UPDATE utente SET ativo = ?, motivo_inativacao = ?, dataAtualizacao = ? WHERE id = ?')
      .run(ativo ? 1 : 0, ativo ? null : (motivo || null), new Date().toISOString(), id);
  }

  desativarMedico(medicoId: number, adminId: number, password: string, realocacoes: Array<{ utenteId: number; novoMedicoId: number }>) {
    if (!password) throw new Error('Password é obrigatória.');
    const admin = db.prepare('SELECT * FROM administrador WHERE id = ?').get(adminId) as any;
    if (!admin || !bcrypt.compareSync(password, admin.password_hash))
      throw new Error('Password incorreta.');

    const medico = db.prepare('SELECT * FROM medico WHERE id = ?').get(medicoId) as any;
    if (!medico) throw new Error('Médico não encontrado.');

    for (const r of realocacoes) {
      if (!db.prepare('SELECT id FROM medico WHERE id = ? AND ativo = 1').get(Number(r.novoMedicoId)))
        throw new Error(`Médico destino ID ${r.novoMedicoId} não encontrado ou inativo.`);
    }

    const now = new Date().toISOString();
    for (const r of realocacoes) {
      db.prepare('UPDATE utente SET medico_id = ?, dataAtualizacao = ? WHERE id = ?')
        .run(Number(r.novoMedicoId), now, Number(r.utenteId));
    }
    db.prepare('UPDATE medico SET ativo = 0, dataAtualizacao = ? WHERE id = ?').run(now, medicoId);

    return { medico, realocacoes, utentesMigrados: realocacoes.length };
  }

  getUtentesDeMedico(medicoId: number) {
    return db.prepare('SELECT id, nome FROM utente WHERE medico_id = ? AND ativo = 1').all(medicoId);
  }

  realocarUtentes(medicoId: number, novoMedicoId: number) {
    if (!novoMedicoId) throw new Error('novoMedicoId é obrigatório.');
    if (!db.prepare('SELECT id FROM medico WHERE id = ? AND ativo = 1').get(novoMedicoId))
      throw new Error('Médico de destino não encontrado ou inativo.');
    db.prepare('UPDATE utente SET medico_id = ?, dataAtualizacao = ? WHERE medico_id = ? AND ativo = 1')
      .run(novoMedicoId, new Date().toISOString(), medicoId);
  }
}

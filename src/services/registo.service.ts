import bcrypt from 'bcryptjs';
import { db } from '../database/database';
import { CreateUtenteDto } from '../dtos/utente/create-utente.dto';
import { CreateMedicoDto } from '../dtos/medico/create-medico.dto';

export class RegistoService {

  listarUtentes(medicoId?: number) {
    return medicoId
      ? db.prepare('SELECT id, nome, username, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id FROM utente WHERE medico_id = ?').all(medicoId)
      : db.prepare('SELECT id, nome, username, sexo, idade, diagnostico_asma, data_primeira_consulta, medico_id FROM utente').all();
  }

  getUtente(id: number) {
    return db.prepare('SELECT * FROM utente WHERE id = ?').get(id);
  }

  listarMedicos() {
    return db.prepare('SELECT id, nome, especialidade FROM medico').all();
  }

  criarUtente(dados: CreateUtenteDto) {
    if (db.prepare('SELECT id FROM utente WHERE username = ?').get(dados.username))
      throw new Error('Username já existe.');

    let idade: number | null = null;
    if (dados.data_nascimento) {
      const nasc = new Date(dados.data_nascimento), hoje = new Date();
      let i = hoje.getFullYear() - nasc.getFullYear();
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--;
      idade = i >= 0 ? i : 0;
    }

    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO utente (nome, username, password_hash, sexo, idade, data_nascimento, diagnostico_asma, data_primeira_consulta, medico_id, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      dados.nome, dados.username, bcrypt.hashSync(dados.password, 10),
      dados.sexo || null, idade, dados.data_nascimento || null,
      (dados.diagnostico_asma === true || dados.diagnostico_asma === 'true') ? 1 : 0,
      dados.data_primeira_consulta || null,
      dados.medico_id ? Number(dados.medico_id) : null,
      now, now
    );
    return { id: Number(result.lastInsertRowid), nome: dados.nome };
  }

  criarMedico(dados: CreateMedicoDto) {
    if (db.prepare('SELECT id FROM medico WHERE username = ?').get(dados.username))
      throw new Error('Username já existe.');

    const cedulaNorm = dados.numero_cedula ? dados.numero_cedula.toUpperCase() : null;
    if (cedulaNorm && db.prepare('SELECT id FROM medico WHERE UPPER(numero_cedula) = ?').get(cedulaNorm))
      throw new Error('Cédula profissional já registada noutro médico.');

    const now = new Date().toISOString();
    const result = db.prepare(
      `INSERT INTO medico (nome, username, password_hash, especialidade, numero_cedula, ativo, dataCriacao, dataAtualizacao)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(dados.nome, dados.username, bcrypt.hashSync(dados.password, 10), dados.especialidade || 'Medicina Geral', cedulaNorm, now, now);
    return { id: Number(result.lastInsertRowid), nome: dados.nome };
  }

  getPerfil(utenteId: number) {
    return db.prepare(
      'SELECT id, nome, username, email, telefone, data_nascimento, nif, rua, numero_porta, codigo_postal, localidade, alergia, sexo, idade FROM utente WHERE id = ?'
    ).get(utenteId);
  }

  atualizarPerfil(utenteId: number, dados: Record<string, any>) {
    const existing = db.prepare('SELECT data_nascimento, nome FROM utente WHERE id = ?').get(utenteId) as any;
    const nascFinal = existing.data_nascimento || dados.data_nascimento || null;

    let idadeFinal: number | null = null;
    if (nascFinal) {
      const nasc = new Date(nascFinal), hoje = new Date();
      let i = hoje.getFullYear() - nasc.getFullYear();
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--;
      idadeFinal = i >= 0 ? i : null;
    }

    db.prepare(
      'UPDATE utente SET email=?, telefone=?, data_nascimento=?, nif=?, rua=?, numero_porta=?, codigo_postal=?, localidade=?, alergia=?, idade=?, dataAtualizacao=? WHERE id=?'
    ).run(
      dados.email || null, dados.telefone || null, nascFinal,
      dados.nif || null, dados.rua || null, dados.numero_porta || null,
      dados.codigo_postal || null, dados.localidade || null, dados.alergia || null,
      idadeFinal, new Date().toISOString(), utenteId
    );

    return existing.nome as string;
  }
}

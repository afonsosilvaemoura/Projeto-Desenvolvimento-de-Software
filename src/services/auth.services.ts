import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/database';
import { appConfig } from '../config/app.config';

export class AuthService {
  async login(username: string, password: string, role: string) {
    const roleNorm = role === 'admin' ? 'administrador' : role;

    const table =
      roleNorm === 'utente' ? 'utente' :
      roleNorm === 'medico' ? 'medico' :
      roleNorm === 'administrador' ? 'administrador' : null;

    if (!table) throw new Error('Role inválido.');

    const userRow = db.prepare(`SELECT * FROM ${table} WHERE username = ?`).get(username) as any;

    if (!userRow) throw new Error('Credenciais inválidas.');
    if (!bcrypt.compareSync(password, userRow.password_hash)) throw new Error('Credenciais inválidas.');
    if (table !== 'administrador' && userRow.ativo === 0)
      throw new Error('Conta inativa. Contacte o administrador.');

    const token = jwt.sign(
      { id: userRow.id, username: userRow.username, role: roleNorm, nome: userRow.nome },
      appConfig.auth.jwtSecret,
      { expiresIn: '8h' }
    );

    return { token, role: roleNorm, userId: userRow.id, nome: userRow.nome };
  }
}

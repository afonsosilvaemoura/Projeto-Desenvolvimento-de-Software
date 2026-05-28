import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/database';
import { Utente }        from '../models/utente.entity';
import { Medico }        from '../models/medico.entity';
import { Administrador } from '../models/administrador.entity';
import { appConfig }     from '../config/app.config';

export class AuthService {
  async login(
    username: string,
    password: string,
    role: string
  ): Promise<{ token: string; role: string; userId: number; nome: string }> {

    const roleNorm = role === 'admin' ? 'administrador' : role;
    let userRow: any = null;

    if (roleNorm === 'utente') {
      userRow = await AppDataSource.getRepository(Utente).findOne({ where: { username } });
    } else if (roleNorm === 'medico') {
      userRow = await AppDataSource.getRepository(Medico).findOne({ where: { username } });
    } else if (roleNorm === 'administrador') {
      userRow = await AppDataSource.getRepository(Administrador).findOne({ where: { username } });
    }

    if (!userRow) throw new Error('Credenciais inválidas.');
    if (!bcrypt.compareSync(password, userRow.password_hash)) throw new Error('Credenciais inválidas.');

    const token = jwt.sign(
      { id: userRow.id, username: userRow.username, role: roleNorm, nome: userRow.nome },
      appConfig.auth.jwtSecret,
      { expiresIn: '8h' }
    );

    return { token, role: roleNorm, userId: userRow.id, nome: userRow.nome };
  }
}
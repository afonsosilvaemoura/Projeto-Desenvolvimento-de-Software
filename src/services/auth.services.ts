import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { appConfig } from '../config/app.config';

const mockUsers = [
  { id: 1, username: 'joao',    password: bcrypt.hashSync('1234',  10), role: 'utente',       nome: 'João Silva'   },
  { id: 2, username: 'medico1', password: bcrypt.hashSync('1234', 10), role: 'medico',        nome: 'Dr. Carlos'   },
  { id: 3, username: 'admin',   password: bcrypt.hashSync('1234', 10), role: 'administrador', nome: 'Administrador' },
];

export class AuthService {
  login(username: string, password: string, role: string): { token: string; role: string; userId: number; nome: string } {
    const user = mockUsers.find(u => u.username === username);
    if (!user) throw new Error('Credenciais inválidas.');

    const roleNormalizado = role === 'admin' ? 'administrador' : role;
    if (user.role !== roleNormalizado) throw new Error('Tipo de acesso incorreto para este utilizador.');

    if (!bcrypt.compareSync(password, user.password)) throw new Error('Credenciais inválidas.');

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nome: user.nome },
      appConfig.auth.jwtSecret,
      { expiresIn: '8h' }
    );
    return { token, role: user.role, userId: user.id, nome: user.nome };
  }
}
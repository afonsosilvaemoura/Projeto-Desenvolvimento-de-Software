import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/db';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../middleware/auth';
import { registarAuditoria } from '../services/auditoria';
import { PerfilUtilizador } from '../models/entities';
import { AlertaController } from '../controller/alerta';

export class AuthController {
  // POST /auth/login
  login(req: Request, res: Response): void {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ erro: 'Email e password são obrigatórios.' });
      return;
    }

    const db = getDb();
    const utilizador = db.prepare(
      'SELECT * FROM utilizadores WHERE email = ?'
    ).get(email) as any;

    if (!utilizador) {
      res.status(401).json({ erro: 'Credenciais inválidas.' });
      return;
    }

    if (!utilizador.ativo) {
      registarAuditoria(null, 'LOGIN_FALHOU_CONTA_INATIVA', 'utilizadores', utilizador.id);
      res.status(401).json({ erro: 'Conta inativa. Contacte o Administrador.' });
      return;
    }

    const passwordValida = bcrypt.compareSync(password, utilizador.password_hash);
    if (!passwordValida) {
      res.status(401).json({ erro: 'Credenciais inválidas.' });
      return;
    }

    const payload = {
      id: utilizador.id,
      email: utilizador.email,
      perfil: utilizador.perfil as PerfilUtilizador,
      nome: utilizador.nome,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    registarAuditoria(utilizador.id, 'LOGIN', 'utilizadores', utilizador.id);

    res.json({
      token,
      utilizador: {
        id: utilizador.id,
        nome: utilizador.nome,
        email: utilizador.email,
        perfil: utilizador.perfil,
      },
    });
  }

  // POST /auth/logout
  logout(req: Request, res: Response): void {
    registarAuditoria(req.utilizador?.id ?? null, 'LOGOUT', 'utilizadores', req.utilizador?.id);
    res.json({ mensagem: 'Sessão terminada com sucesso.' });
  }

  // GET /auth/me
  me(req: Request, res: Response): void {
    const db = getDb();
    const u = db.prepare('SELECT id,nome,email,perfil,ativo FROM utilizadores WHERE id = ?')
      .get(req.utilizador!.id) as any;
    if (!u) { res.status(404).json({ erro: 'Utilizador não encontrado.' }); return; }
    res.json(u);
  }
}


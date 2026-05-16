import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PerfilUtilizador } from '../models/todos.entity';
import { getDb } from '../database/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'saudinob-secret-key-2026';
export const JWT_EXPIRES_IN = '8h';

export interface JwtPayload {
  id: string;
  email: string;
  perfil: PerfilUtilizador;
  nome: string;
}

// Extende Request para incluir o utilizador autenticado
declare global {
  namespace Express {
    interface Request {
      utilizador?: JwtPayload;
    }
  }
}

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.utilizador = payload;
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Middleware de autorização por perfil
export function autorizar(...perfis: PerfilUtilizador[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.utilizador) {
      res.status(401).json({ erro: 'Não autenticado.' });
      return;
    }
    if (!perfis.includes(req.utilizador.perfil)) {
      res.status(403).json({ erro: 'Acesso negado. Permissões insuficientes.' });
      return;
    }
    next();
  };
}

// Garante que o médico só acede a utentes que lhe estão atribuídos
export function verificarAcessoUtente(req: Request, res: Response, next: NextFunction): void {
  const user = req.utilizador!;
  const utenteId = req.params.utenteId || req.params.id;

  if (user.perfil === PerfilUtilizador.ADMINISTRADOR) {
    next();
    return;
  }
  if (user.perfil === PerfilUtilizador.UTENTE) {
    if (user.id !== utenteId) {
      res.status(403).json({ erro: 'Só pode aceder aos seus próprios dados.' });
      return;
    }
    next();
    return;
  }
  if (user.perfil === PerfilUtilizador.MEDICO) {
    const db = getDb();
    const utente = db.prepare(
      'SELECT id FROM utentes WHERE id = ? AND medico_id = ?'
    ).get(utenteId, user.id);
    if (!utente) {
      res.status(403).json({ erro: 'Este utente não lhe está atribuído.' });
      return;
    }
    next();
    return;
  }
  res.status(403).json({ erro: 'Acesso negado.' });
}

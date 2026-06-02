import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config';

// ── Interface estendida ───────────────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    nome: string;
  };
}

// ── Middleware: Autenticação (verifica JWT) ───────────────────────────────
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token ausente.' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ erro: 'Formato do token inválido.' });

  try {
    const decoded = jwt.verify(token, appConfig.auth.jwtSecret) as {
      id: number; username: string; role: string; nome: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// ── Middleware: Autorização (verifica roles) ──────────────────────────────
export function authorize(rolesPermitidos: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ erro: 'Não autenticado.' });
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ erro: 'Acesso negado: permissões insuficientes.' });
    }
    next();
  };
}

// ── Helper: Assert Admin (para usar em funções) ────────────────────────────
export function assertAdmin(user: AuthRequest['user']): void {
  if (!user || user.role !== 'administrador') {
    throw new Error('Acesso negado: apenas administradores.');
  }
}

// ── Helper: Assert Role ────────────────────────────────────────────────────
export function assertRole(user: AuthRequest['user'], rolesPermitidos: string[]): void {
  if (!user || !rolesPermitidos.includes(user.role)) {
    throw new Error('Acesso negado: permissões insuficientes.');
  }
}
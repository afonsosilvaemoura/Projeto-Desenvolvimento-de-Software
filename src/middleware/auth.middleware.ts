import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config';

// 1. Defina a interface estendida corretamente
export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
    };
}

// 2. Middleware de Autenticação (Verifica SE o utilizador está logado)
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token ausente.' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ erro: 'Formato do token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, appConfig.auth.jwtSecret) as {
            id: number;
            username: string;
            role: string;
        };

        req.user = decoded; // Injeta o utilizador no request
        next();             // Passa para o próximo middleware (role check)
    } catch {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}

// 3. Middleware de Autorização (Verifica SE o utilizador tem a role certa)
export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ erro: 'Acesso Negado: perfil insuficiente.' });
        }

        next();
    };
};
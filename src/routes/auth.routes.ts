// src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import { baseDeDadosUsers } from '../database/database';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ erro: 'Campos em falta.' });
    }

    const roleNormalizado = role === 'admin' ? 'administrador' : role;

    const utilizador = baseDeDadosUsers.find(
        u => u.username === username &&
             u.password === password &&
             u.role === roleNormalizado
    );

    if (!utilizador) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Em produção, use jsonwebtoken. Por agora, um token simples serve:
    const token = Buffer.from(`${utilizador.id}:${utilizador.role}`).toString('base64');

    return res.json({ token, role: utilizador.role, id: utilizador.id });
});

export default router;
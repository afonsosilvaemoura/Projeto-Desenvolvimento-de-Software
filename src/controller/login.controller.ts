import { Request, Response } from 'express';
import { AuthService } from '../services/auth.services';
import { baseDeDadosUsers } from '../database/database';


export class LoginController {
    private authService = new AuthService();

    login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            const token = this.authService.login(username, password);

            return res.status(200).json({
                mensagem: 'Login com sucesso',
                token
            });
        } catch (error: any) {
            return res.status(401).json({
                erro: error.message
            });
        }
    }
}





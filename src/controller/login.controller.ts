import { Request, Response } from 'express';
import { AuthService } from '../services/auth.services';

export class LoginController {
  private authService = new AuthService();

  login(req: Request, res: Response) {
    try {
      const { username, password, role } = req.body;
      const result = this.authService.login(username, password, role);
      return res.status(200).json({ mensagem: 'Login com sucesso', ...result });
    } catch (error: any) {
      return res.status(401).json({ erro: error.message });
    }
  }
}
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.services';

export class LoginController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    try {
      const { username, password, role } = req.body;
      const result = await this.authService.login(username, password, role);
      console.log(`Login bem-sucedido para ${role} "${username}".`);
      return res.status(200).json({ mensagem: 'Login com sucesso', ...result });
    } catch (error: any) {
      console.error(`Erro de login para "${req.body.username}": ${error.message}`);
      return res.status(401).json({ erro: error.message });
    }
  }
}
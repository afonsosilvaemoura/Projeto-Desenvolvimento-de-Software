import { Request, Response } from 'express';
import { AuthService } from '../services/auth.services';
import { auditoriaService } from '../services/auditoria.service';

const ip = (req: Request) =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '?';

export class LoginController {
  private authService = new AuthService();

  async login(req: Request, res: Response) {
    const { username, password, role } = req.body;
    try {
      const result = await this.authService.login(username, password, role);
      auditoriaService.loginSucesso(result.userId, result.nome, result.role, ip(req));
      console.log(`Login bem-sucedido para ${role} "${username}".`);
      return res.status(200).json({ mensagem: 'Login com sucesso', ...result });
    } catch (error: any) {
      auditoriaService.loginFalha(username ?? '?', error.message, ip(req));
      console.error(`Erro de login para "${username}": ${error.message}`);
      return res.status(401).json({ erro: error.message });
    }
  }
}

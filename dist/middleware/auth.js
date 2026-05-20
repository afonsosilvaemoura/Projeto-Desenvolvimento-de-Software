"use strict";
// Middleware de autenticação.
// Interceta pedidos antes de chegarem ao controller, verifica se existe um
// token JWT no header Authorization, valida esse token e, se for válido,
// guarda os dados do utilizador em req.user e permite continuar para a rota.
// Se o token estiver ausente, mal formatado ou inválido, devolve erro 401.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../config/app.config");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido.' });
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ erro: 'Formato do token inválido.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, app_config_1.appConfig.auth.jwtSecret);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}

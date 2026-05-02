"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const auditoria_1 = require("../services/auditoria");
class AuthController {
    // POST /auth/login
    login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ erro: 'Email e password são obrigatórios.' });
            return;
        }
        const db = (0, db_1.getDb)();
        const utilizador = db.prepare('SELECT * FROM utilizadores WHERE email = ?').get(email);
        if (!utilizador) {
            res.status(401).json({ erro: 'Credenciais inválidas.' });
            return;
        }
        if (!utilizador.ativo) {
            (0, auditoria_1.registarAuditoria)(null, 'LOGIN_FALHOU_CONTA_INATIVA', 'utilizadores', utilizador.id);
            res.status(401).json({ erro: 'Conta inativa. Contacte o Administrador.' });
            return;
        }
        const passwordValida = bcrypt_1.default.compareSync(password, utilizador.password_hash);
        if (!passwordValida) {
            res.status(401).json({ erro: 'Credenciais inválidas.' });
            return;
        }
        const payload = {
            id: utilizador.id,
            email: utilizador.email,
            perfil: utilizador.perfil,
            nome: utilizador.nome,
        };
        const token = jsonwebtoken_1.default.sign(payload, auth_1.JWT_SECRET, { expiresIn: auth_1.JWT_EXPIRES_IN });
        (0, auditoria_1.registarAuditoria)(utilizador.id, 'LOGIN', 'utilizadores', utilizador.id);
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
    logout(req, res) {
        (0, auditoria_1.registarAuditoria)(req.utilizador?.id ?? null, 'LOGOUT', 'utilizadores', req.utilizador?.id);
        res.json({ mensagem: 'Sessão terminada com sucesso.' });
    }
    // GET /auth/me
    me(req, res) {
        const db = (0, db_1.getDb)();
        const u = db.prepare('SELECT id,nome,email,perfil,ativo FROM utilizadores WHERE id = ?')
            .get(req.utilizador.id);
        if (!u) {
            res.status(404).json({ erro: 'Utilizador não encontrado.' });
            return;
        }
        res.json(u);
    }
}
exports.AuthController = AuthController;

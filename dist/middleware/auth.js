"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_EXPIRES_IN = exports.JWT_SECRET = void 0;
exports.autenticar = autenticar;
exports.autorizar = autorizar;
exports.verificarAcessoUtente = verificarAcessoUtente;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const entities_1 = require("../models/entities");
const db_1 = require("../database/db");
exports.JWT_SECRET = process.env.JWT_SECRET || 'saudinob-secret-key-2026';
exports.JWT_EXPIRES_IN = '8h';
function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, exports.JWT_SECRET);
        req.utilizador = payload;
        next();
    }
    catch {
        res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
}
// Middleware de autorização por perfil
function autorizar(...perfis) {
    return (req, res, next) => {
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
function verificarAcessoUtente(req, res, next) {
    const user = req.utilizador;
    const utenteId = req.params.utenteId || req.params.id;
    if (user.perfil === entities_1.PerfilUtilizador.ADMINISTRADOR) {
        next();
        return;
    }
    if (user.perfil === entities_1.PerfilUtilizador.UTENTE) {
        if (user.id !== utenteId) {
            res.status(403).json({ erro: 'Só pode aceder aos seus próprios dados.' });
            return;
        }
        next();
        return;
    }
    if (user.perfil === entities_1.PerfilUtilizador.MEDICO) {
        const db = (0, db_1.getDb)();
        const utente = db.prepare('SELECT id FROM utentes WHERE id = ? AND medico_id = ?').get(utenteId, user.id);
        if (!utente) {
            res.status(403).json({ erro: 'Este utente não lhe está atribuído.' });
            return;
        }
        next();
        return;
    }
    res.status(403).json({ erro: 'Acesso negado.' });
}

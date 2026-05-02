"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carat_1 = require("../controller/carat");
const auth_1 = require("../middleware/auth");
const entities_1 = require("../models/entities");
const router = (0, express_1.Router)();
const ctrl = new carat_1.CaratController();
const { MEDICO, UTENTE } = entities_1.PerfilUtilizador;
// GET /carat/perguntas  — público
router.get('/perguntas', (req, res) => ctrl.perguntas(req, res));
// POST /carat/avaliacoes  — autenticado OU anónimo
router.post('/avaliacoes', (req, res, next) => {
    // Tenta autenticar mas não bloqueia se não houver token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        (0, auth_1.autenticar)(req, res, next);
    }
    else {
        next(); // utilizador anónimo
    }
}, (req, res) => ctrl.submeter(req, res));
// GET /carat/avaliacoes/utente/:utenteId
router.get('/avaliacoes/utente/:utenteId', auth_1.autenticar, (0, auth_1.autorizar)(MEDICO, UTENTE), auth_1.verificarAcessoUtente, (req, res) => ctrl.historico(req, res));
// GET /carat/avaliacoes/:id
router.get('/avaliacoes/:id', auth_1.autenticar, (req, res) => ctrl.obter(req, res));
exports.default = router;

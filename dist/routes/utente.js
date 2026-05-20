"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const utente_1 = require("../controller/utente");
const auth_1 = require("../middleware/auth");
const todos_entity_1 = require("../models/todos.entity");
const router = (0, express_1.Router)();
const ctrl = new utente_1.UtenteController();
const { ADMINISTRADOR, MEDICO, UTENTE } = todos_entity_1.PerfilUtilizador;
// GET /utentes
router.get('/', auth_1.autenticar, (0, auth_1.autorizar)(ADMINISTRADOR, MEDICO), (req, res) => ctrl.listar(req, res));
// POST /utentes
router.post('/', auth_1.autenticar, (0, auth_1.autorizar)(ADMINISTRADOR), (req, res) => ctrl.criar(req, res));
// GET /utentes/:id
router.get('/:id', auth_1.autenticar, auth_1.verificarAcessoUtente, (req, res) => ctrl.obter(req, res));
// PUT /utentes/:id
router.put('/:id', auth_1.autenticar, auth_1.verificarAcessoUtente, (req, res) => ctrl.atualizar(req, res));
// DELETE /utentes/:id  (apenas Admin)
router.delete('/:id', auth_1.autenticar, (0, auth_1.autorizar)(ADMINISTRADOR), (req, res) => ctrl.remover(req, res));
// GET /utentes/:id/historico-clinico  (Médico ou Utente próprio)
router.get('/:id/historico-clinico', auth_1.autenticar, (0, auth_1.autorizar)(MEDICO, UTENTE), auth_1.verificarAcessoUtente, (req, res) => ctrl.historicoClinico(req, res));
exports.default = router;

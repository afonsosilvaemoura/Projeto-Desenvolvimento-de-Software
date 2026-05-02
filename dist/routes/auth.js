"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controller/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
const ctrl = new auth_1.AuthController();
// POST /auth/login
router.post('/login', (req, res) => ctrl.login(req, res));
// POST /auth/logout  (requer autenticação)
router.post('/logout', auth_2.autenticar, (req, res) => ctrl.logout(req, res));
// GET /auth/me
router.get('/me', auth_2.autenticar, (req, res) => ctrl.me(req, res));
exports.default = router;

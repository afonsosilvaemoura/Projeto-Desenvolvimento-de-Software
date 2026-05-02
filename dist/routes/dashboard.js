"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../controller/dashboard");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const ctrl = new dashboard_1.DashboardController();
router.get('/:utenteId', auth_1.autenticar, auth_1.verificarAcessoUtente, (req, res) => ctrl.obter(req, res));
exports.default = router;

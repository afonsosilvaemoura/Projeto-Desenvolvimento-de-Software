"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaratController = void 0;
const carat_service_1 = require("../services/carat.service");
class CaratController {
    constructor() {
        this.service = new carat_service_1.CaratService();
    }
    async listar(req, res) {
        const carat = await this.service.listarCarat();
        return res.json(carat);
    }
    async criar(req, res) {
        try {
            const { codigo, perguntas } = req.body;
            const novoCarat = await this.service.criarCarat({ codigo, perguntas });
            return res.status(201).json({
                mensagem: `Carat ${novoCarat.codigo} registado no sistema`,
                carat: novoCarat
            });
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
exports.CaratController = CaratController;

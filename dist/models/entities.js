"use strict";
// =========================================================
// ENUMS
// =========================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotivoRemocaoUtente = exports.EstadoMedicacao = exports.TipoAlerta = exports.PrioridadeAlerta = exports.EstadoAlerta = exports.NivelControlo = exports.PerfilUtilizador = void 0;
var PerfilUtilizador;
(function (PerfilUtilizador) {
    PerfilUtilizador["UTENTE"] = "UTENTE";
    PerfilUtilizador["MEDICO"] = "MEDICO";
    PerfilUtilizador["ADMINISTRADOR"] = "ADMINISTRADOR";
})(PerfilUtilizador || (exports.PerfilUtilizador = PerfilUtilizador = {}));
var NivelControlo;
(function (NivelControlo) {
    NivelControlo["CONTROLADA"] = "CONTROLADA";
    NivelControlo["PARCIALMENTE_CONTROLADA"] = "PARCIALMENTE_CONTROLADA";
    NivelControlo["NAO_CONTROLADA"] = "NAO_CONTROLADA";
})(NivelControlo || (exports.NivelControlo = NivelControlo = {}));
var EstadoAlerta;
(function (EstadoAlerta) {
    EstadoAlerta["NOVO"] = "NOVO";
    EstadoAlerta["VISTO"] = "VISTO";
    EstadoAlerta["EM_SEGUIMENTO"] = "EM_SEGUIMENTO";
    EstadoAlerta["FECHADO"] = "FECHADO";
})(EstadoAlerta || (exports.EstadoAlerta = EstadoAlerta = {}));
var PrioridadeAlerta;
(function (PrioridadeAlerta) {
    PrioridadeAlerta["BAIXA"] = "BAIXA";
    PrioridadeAlerta["MEDIA"] = "MEDIA";
    PrioridadeAlerta["ALTA"] = "ALTA";
    PrioridadeAlerta["CRITICA"] = "CRITICA";
})(PrioridadeAlerta || (exports.PrioridadeAlerta = PrioridadeAlerta = {}));
var TipoAlerta;
(function (TipoAlerta) {
    TipoAlerta["SCORE_BAIXO"] = "SCORE_BAIXO";
    TipoAlerta["DETERIORACAO"] = "DETERIORACAO";
    TipoAlerta["SINTOMA"] = "SINTOMA";
    TipoAlerta["MEDICACAO"] = "MEDICACAO";
})(TipoAlerta || (exports.TipoAlerta = TipoAlerta = {}));
var EstadoMedicacao;
(function (EstadoMedicacao) {
    EstadoMedicacao["ATIVA"] = "ATIVA";
    EstadoMedicacao["INATIVA"] = "INATIVA";
})(EstadoMedicacao || (exports.EstadoMedicacao = EstadoMedicacao = {}));
var MotivoRemocaoUtente;
(function (MotivoRemocaoUtente) {
    MotivoRemocaoUtente["FALECIDO"] = "FALECIDO";
    MotivoRemocaoUtente["PEDIDO_UTENTE"] = "PEDIDO_UTENTE";
    MotivoRemocaoUtente["DUPLICACAO_REGISTO"] = "DUPLICACAO_REGISTO";
    MotivoRemocaoUtente["OUTRO"] = "OUTRO";
})(MotivoRemocaoUtente || (exports.MotivoRemocaoUtente = MotivoRemocaoUtente = {}));

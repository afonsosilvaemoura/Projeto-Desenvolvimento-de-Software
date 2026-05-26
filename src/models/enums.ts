// Centraliza todos os enums do domínio SAUDINOB.
// Seguindo o padrão do projeto, os enums são definidos aqui
// e importados pelas entities e services que deles necessitam.
 
export enum PerfilUtilizador {
    UTENTE = 'UTENTE',
    MEDICO = 'MEDICO',
    ADMINISTRADOR = 'ADMINISTRADOR',
}
 
export enum NivelControlo {
    CONTROLADA = 'CONTROLADA',
    PARCIALMENTE_CONTROLADA = 'PARCIALMENTE_CONTROLADA',
    NAO_CONTROLADA = 'NAO_CONTROLADA',
}
 
export enum EstadoAlerta {
    NOVO = 'NOVO',
    VISTO = 'VISTO',
    EM_SEGUIMENTO = 'EM_SEGUIMENTO',
    FECHADO = 'FECHADO',
}
 
export enum PrioridadeAlerta {
    BAIXA = 'BAIXA',
    MEDIA = 'MEDIA',
    ALTA = 'ALTA',
    CRITICA = 'CRITICA',
}
 
export enum TipoAlerta {
    SCORE_BAIXO = 'SCORE_BAIXO',
    DETERIORACAO = 'DETERIORACAO',
}
 
export enum EstadoMedicacao {
    ATIVA = 'ATIVA',
    INATIVA = 'INATIVA',
}
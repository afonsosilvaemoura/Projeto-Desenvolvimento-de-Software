export type EstadoAlerta    = 'NOVO' | 'VISTO' | 'EM_SEGUIMENTO' | 'FECHADO';
export type TipoAlerta      = 'SCORE_BAIXO' | 'DETERIORACAO';
export type PrioridadeAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export interface Alerta {
  id:              number;
  utente_id:       number;
  medico_nome?:    string | null;
  avaliacao_id?:   number | null;
  tipo:            TipoAlerta;
  prioridade:      PrioridadeAlerta;
  motivo?:         string | null;
  estado:          EstadoAlerta;
  dataCriacao:     string;
  dataAtualizacao: string;
}

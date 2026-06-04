// Representa os dados de um alerta devolvidos pela API.
export interface AlertaResponseDto {
  id:            number;
  utente_id:     number;
  utente_nome?:  string;
  tipo:          'SCORE_BAIXO' | 'DETERIORACAO';
  prioridade:    'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
  motivo?:       string;
  estado:        'NOVO' | 'VISTO' | 'EM_SEGUIMENTO' | 'FECHADO';
  ultimo_score?: number;
  dataCriacao:   string;
}

export interface UpdateEstadoAlertaDto {
  estado: 'EM_SEGUIMENTO' | 'FECHADO';
}

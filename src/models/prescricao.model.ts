export interface Prescricao {
  id:                   number;
  utente_id:            number;
  medico_nome:          string;
  farmaco:              string;
  dosagem:              string;
  posologia:            string;
  ativo:                number; // 0 | 1
  embalagens_total:     number;
  embalagens_levantadas: number;
  data_criacao:         string;
}

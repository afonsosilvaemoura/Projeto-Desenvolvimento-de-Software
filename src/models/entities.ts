// =========================================================
// ENUMS
// =========================================================

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
  SINTOMA = 'SINTOMA',
  MEDICACAO = 'MEDICACAO',
}

export enum EstadoMedicacao {
  ATIVA = 'ATIVA',
  INATIVA = 'INATIVA',
}

export enum MotivoRemocaoUtente {
  FALECIDO = 'FALECIDO',
  PEDIDO_UTENTE = 'PEDIDO_UTENTE',
  DUPLICACAO_REGISTO = 'DUPLICACAO_REGISTO',
  OUTRO = 'OUTRO',
}

// =========================================================
// INTERFACES
// =========================================================

export interface Utilizador {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  perfil: PerfilUtilizador;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Utente extends Omit<Utilizador, 'perfil'> {
  perfil: PerfilUtilizador.UTENTE;
  data_nascimento: string;
  nif: string;
  telefone: string;
  medico_id: string;
}

export interface Medico extends Omit<Utilizador, 'perfil'> {
  perfil: PerfilUtilizador.MEDICO;
  numero_cedula: string;
  especialidade: string;
}

export interface AvaliacaoCARAT {
  id: string;
  utente_id: string | null; // null se anónimo
  medico_id: string | null;
  data: string;
  respostas: number[]; // array de 10 respostas (0-4 cada)
  score: number;
  nivel_controlo: NivelControlo;
  recomendacoes: string;
  proximo_passo_semanas: number;
  anonima: boolean;
  criado_em: string;
}

export interface Alerta {
  id: string;
  utente_id: string;
  medico_id: string;
  avaliacao_id: string | null;
  tipo: TipoAlerta;
  prioridade: PrioridadeAlerta;
  motivo: string;
  estado: EstadoAlerta;
  criado_em: string;
  atualizado_em: string;
}

export interface AlertaAcao {
  id: string;
  alerta_id: string;
  utilizador_id: string;
  estado_novo: EstadoAlerta;
  nota: string;
  data: string;
}

export interface Medicacao {
  id: string;
  utente_id: string;
  medico_id: string;
  farmaco: string;
  dosagem: string;
  posologia: string;
  data_inicio: string;
  data_fim: string | null;
  estado: EstadoMedicacao;
  motivo_suspensao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface Exame {
  id: string;
  utente_id: string;
  medico_id: string;
  tipo: string;
  justificacao: string;
  data: string;
  resultado: string | null;
  criado_em: string;
}

export interface Auditoria {
  id: string;
  utilizador_id: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  dados: string | null; // JSON string
  data: string;
}

export interface LimiarAlerta {
  id: string;
  score_minimo: number;        // score abaixo deste => alerta SCORE_BAIXO
  deterioracao_pontos: number; // queda vs última avaliação => alerta DETERIORACAO
  atualizado_em: string;
}

export interface TokenSessao {
  id: string;
  utilizador_id: string;
  token: string;
  criado_em: string;
  expira_em: string;
}


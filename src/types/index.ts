export type StatusConsulta = 'AGENDADA' | 'REALIZADA' | 'FALTA' | 'CANCELADA'
export type StatusEncaminhamento =
  'NA_FILA' | 'ASSUMIDO' | 'EM_TRATAMENTO' | 'ALTA' | 'RETIRADO_PELO_PACIENTE'
export type Prioridade = 'PRIMARIA' | 'SECUNDARIA' | 'TERCIARIA'
export type TipoAtendimento = 'SUS' | 'CONVENIO'

export interface Paciente {
  id: number
  numeroSus: string
  nome: string
  dataNascimento: string | null
  dataEntrada: string | null
  telefone: string | null
  endereco: string | null
}

export type PacienteInput = Omit<Paciente, 'id'>

export interface Fisioterapeuta {
  id: number
  crefito: string | null
  nome: string
  telefone: string | null
  ativo: boolean
}

export interface Encaminhamento {
  id: number
  dataEntrega: string
  pacienteId: number
  pacienteNome: string
  medicoSolicitante: string
  tipoAtendimento: TipoAtendimento
  statusEncaminhamento: StatusEncaminhamento
  prioridade: Prioridade
  fisioterapeutaResponsavelId: number | null
  fisioterapeutaResponsavelNome: string | null
  dataAssuncao: string | null
  dataRetirada: string | null
  motivoRetirada: string | null
  dataAlta: string | null
  patologia: string
  observacoes: string | null
}

export interface EncaminhamentoInput {
  dataEntrega: string
  paciente: { id: number }
  medicoSolicitante: string
  tipoAtendimento: TipoAtendimento
  statusEncaminhamento: 'NA_FILA'
  prioridade: Prioridade
  patologia: string
  observacoes: string
}

export interface Consulta {
  id: number
  dataHora: string
  status: StatusConsulta
  encaminhamentoId: number
  pacienteId: number
  pacienteNome: string
  fisioterapeutaId: number
  fisioterapeutaNome: string
  observacoes: string | null
  diagnostico: string | null
  procedimentos: string | null
  conduta: string | null
}

export interface ConsultaInput {
  dataHora: string
  encaminhamento: { id: number }
  fisioterapeuta: { id: number }
  observacoes: string
}

export interface IndicadoresEncaminhamento {
  naFila: number
  assumidos: number
  emTratamento: number
  altas: number
  retirados: number
  total: number
}

export interface IndicadoresPrioridade {
  primaria: number
  secundaria: number
  terciaria: number
  total?: number
}

export interface IndicadoresConsulta {
  agendadas: number
  realizadas: number
  faltas: number
  canceladas: number
  total: number
}

export interface TaxaFaltas {
  realizadas: number
  faltas: number
  canceladas: number
  'atendimentos esperados': number
  taxaFaltas: number
}

export interface ApiErrorBody {
  status: number
  erro: string
  mensagem: string
  dataHora: string
}

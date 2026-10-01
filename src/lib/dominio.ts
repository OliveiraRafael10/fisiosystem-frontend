import type { Prioridade, StatusConsulta, StatusEncaminhamento } from '../types/modelos'

export const rotulosStatusEncaminhamento: Record<StatusEncaminhamento, string> = {
  NA_FILA: 'Aguardando vaga',
  ASSUMIDO: 'Assumido',
  EM_TRATAMENTO: 'Em tratamento',
  ALTA: 'Alta',
  RETIRADO_PELO_PACIENTE: 'Retirado',
}

export const rotulosStatusConsulta: Record<StatusConsulta, string> = {
  AGENDADA: 'Agendada',
  REALIZADA: 'Realizada',
  FALTA: 'Falta',
  CANCELADA: 'Cancelada',
}

export const rotulosPrioridade: Record<Prioridade, string> = {
  PRIMARIA: 'Primária',
  SECUNDARIA: 'Secundária',
  TERCIARIA: 'Terciária',
}

export function obterRotuloPrioridade(valor?: Prioridade | null) {
  return valor ? (rotulosPrioridade[valor] ?? 'Não definida') : 'Não definida'
}

export function obterRotuloStatusEncaminhamento(valor?: StatusEncaminhamento | null) {
  return valor ? (rotulosStatusEncaminhamento[valor] ?? 'Não informado') : 'Não informado'
}

export function obterRotuloStatusConsulta(valor?: StatusConsulta | null) {
  return valor ? (rotulosStatusConsulta[valor] ?? 'Não informado') : 'Não informado'
}

export function tomPrioridade(valor?: Prioridade | null) {
  if (valor === 'PRIMARIA') return 'primaria'
  if (valor === 'SECUNDARIA') return 'secundaria'
  if (valor === 'TERCIARIA') return 'terciaria'
  return 'indefinida'
}

export function iniciais(nome?: string | null) {
  if (!nome) return '—'
  return nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatarData(valor?: string | null) {
  if (!valor) return 'Não informado'
  return new Date(`${valor}T12:00:00`).toLocaleDateString('pt-BR')
}

export function formatarDataHora(valor?: string | null) {
  if (!valor) return 'Data não informada'
  return new Date(valor).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function dataLocal(data = new Date()) {
  const fusoEmMilissegundos = data.getTimezoneOffset() * 60000
  return new Date(data.getTime() - fusoEmMilissegundos).toISOString().slice(0, 10)
}

export function diasDeEspera(inicio?: string | null) {
  if (!inicio) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(`${inicio}T12:00:00`).getTime()) / 86400000))
}

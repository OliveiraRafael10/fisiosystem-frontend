import type { Prioridade, StatusConsulta, StatusEncaminhamento } from '../types'

export const statusEncaminhamentoLabel: Record<StatusEncaminhamento, string> = {
  NA_FILA: 'Aguardando vaga',
  ASSUMIDO: 'Assumido',
  EM_TRATAMENTO: 'Em tratamento',
  ALTA: 'Alta',
  RETIRADO_PELO_PACIENTE: 'Retirado',
}

export const statusConsultaLabel: Record<StatusConsulta, string> = {
  AGENDADA: 'Agendada',
  REALIZADA: 'Realizada',
  FALTA: 'Falta',
  CANCELADA: 'Cancelada',
}

export const prioridadeLabel: Record<Prioridade, string> = {
  PRIMARIA: 'Alta',
  SECUNDARIA: 'Média',
  TERCIARIA: 'Baixa',
}

export function initials(name: string) {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

export function formatDate(value?: string | null) {
  if (!value) return 'Não informado'
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function daysWaiting(start: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(`${start}T12:00:00`).getTime()) / 86400000))
}

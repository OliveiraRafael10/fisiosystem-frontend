import { api } from '../api/api'
import type {
  Consulta,
  ConsultaInput,
  IndicadoresConsulta,
  StatusConsulta,
  TaxaFaltas,
} from '../types'

export const appointmentService = {
  async list(): Promise<Consulta[]> {
    const { data } = await api.get<Consulta[]>('/consultas')
    return data
  },
  async agenda(date: string): Promise<Consulta[]> {
    const { data } = await api.get<Consulta[]>('/consultas/agenda', { params: { data: date } })
    return data
  },
  async create(appointment: ConsultaInput): Promise<Consulta> {
    const { data } = await api.post<Consulta>('/consultas', appointment)
    return data
  },
  async byStatus(status: StatusConsulta): Promise<Consulta[]> {
    const { data } = await api.get<Consulta[]>(`/consultas/status/${status}`)
    return data
  },
  async reschedule(id: number, novaDataHora: string): Promise<Consulta> {
    const { data } = await api.put<Consulta>(`/consultas/${id}/reagendar`, { novaDataHora })
    return data
  },
  async complete(
    id: number,
    payload: { diagnostico: string; procedimentos: string; conduta: string },
  ): Promise<Consulta> {
    const { data } = await api.put<Consulta>(`/consultas/${id}/realizar`, payload)
    return data
  },
  async cancel(id: number, observacao: string): Promise<Consulta> {
    const { data } = await api.put<Consulta>(`/consultas/${id}/cancelar`, { observacao })
    return data
  },
  async markAbsence(id: number, observacao: string): Promise<Consulta> {
    const { data } = await api.put<Consulta>(`/consultas/${id}/falta`, { observacao })
    return data
  },
  async indicators(): Promise<IndicadoresConsulta> {
    const { data } = await api.get<IndicadoresConsulta>('/consultas/indicadores')
    return data
  },
  async periodIndicators(dataInicio: string, dataFim: string): Promise<IndicadoresConsulta> {
    const { data } = await api.get<IndicadoresConsulta>('/consultas/indicadores/periodo', {
      params: { dataInicio, dataFim },
    })
    return data
  },
  async absenceRate(dataInicio: string, dataFim: string): Promise<TaxaFaltas> {
    const { data } = await api.get<TaxaFaltas>('/consultas/indicadores/taxa-faltas', {
      params: { dataInicio, dataFim },
    })
    return data
  },
}

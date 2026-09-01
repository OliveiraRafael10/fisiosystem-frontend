import { api } from '../api/api'
import type { Encaminhamento, EncaminhamentoInput, IndicadoresEncaminhamento, IndicadoresPrioridade, Prioridade, StatusEncaminhamento } from '../types'

export const referralService = {
  async list(): Promise<Encaminhamento[]> {
    const { data } = await api.get<Encaminhamento[]>('/encaminhamentos')
    return data
  },
  async queue(): Promise<Encaminhamento[]> {
    const { data } = await api.get<Encaminhamento[]>('/encaminhamentos/fila')
    return data
  },
  async create(referral: EncaminhamentoInput): Promise<Encaminhamento> {
    const { data } = await api.post<Encaminhamento>('/encaminhamentos', referral)
    return data
  },
  async byStatus(status: StatusEncaminhamento): Promise<Encaminhamento[]> {
    const { data } = await api.get<Encaminhamento[]>(`/encaminhamentos/status/${status}`)
    return data
  },
  async byPriority(priority: Prioridade): Promise<Encaminhamento[]> {
    const { data } = await api.get<Encaminhamento[]>(`/encaminhamentos/prioridade/${priority}`)
    return data
  },
  async assume(id: number, fisioterapeutaId: number): Promise<Encaminhamento> {
    const { data } = await api.put<Encaminhamento>(`/encaminhamentos/${id}/assumir`, undefined, { params: { fisioterapeutaId } })
    return data
  },
  async withdraw(id: number, motivo: string): Promise<Encaminhamento> {
    const { data } = await api.put<Encaminhamento>(`/encaminhamentos/${id}/retirar`, { motivo })
    return data
  },
  async discharge(id: number): Promise<Encaminhamento> {
    const { data } = await api.put<Encaminhamento>(`/encaminhamentos/${id}/alta`)
    return data
  },
  async indicators(): Promise<IndicadoresEncaminhamento> {
    const { data } = await api.get<IndicadoresEncaminhamento>('/encaminhamentos/indicadoresStatus')
    return data
  },
  async queuePriorityIndicators(): Promise<IndicadoresPrioridade> {
    const { data } = await api.get<IndicadoresPrioridade>('/encaminhamentos/indicadores/fila-prioridade')
    return data
  },
  async averageWait(): Promise<number> {
    const { data } = await api.get<number>('/encaminhamentos/indicadores/tempo-medio-espera')
    return data
  },
}

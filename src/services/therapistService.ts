import { api } from '../api/api'
import type { Fisioterapeuta } from '../types'

type FisioterapeutaInput = Pick<Fisioterapeuta, 'nome' | 'crefito' | 'telefone'>

export const therapistService = {
  async list(): Promise<Fisioterapeuta[]> {
    const { data } = await api.get<Fisioterapeuta[]>('/fisioterapeuta')
    return data
  },
  async create(therapist: FisioterapeutaInput): Promise<Fisioterapeuta> {
    const { data } = await api.post<Fisioterapeuta>('/fisioterapeuta', therapist)
    return data
  },
  async update(id: number, therapist: FisioterapeutaInput): Promise<Fisioterapeuta> {
    const { data } = await api.put<Fisioterapeuta>(`/fisioterapeuta/${id}`, therapist)
    return data
  },
  async activate(id: number): Promise<Fisioterapeuta> {
    const { data } = await api.put<Fisioterapeuta>(`/fisioterapeuta/${id}/ativar`)
    return data
  },
  async deactivate(id: number): Promise<Fisioterapeuta> {
    const { data } = await api.put<Fisioterapeuta>(`/fisioterapeuta/${id}/inativar`)
    return data
  },
}

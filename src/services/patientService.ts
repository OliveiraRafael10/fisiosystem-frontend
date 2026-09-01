import { api } from '../api/api'
import type { Paciente, PacienteInput } from '../types'

export const patientService = {
  async list(): Promise<Paciente[]> {
    const { data } = await api.get<Paciente[]>('/pacientes')
    return data
  },
  async search(nome: string): Promise<Paciente[]> {
    const { data } = await api.get<Paciente[]>('/pacientes/buscar', { params: { nome } })
    return data
  },
  async getBySus(numeroSus: string): Promise<Paciente> {
    const { data } = await api.get<Paciente>(`/pacientes/sus/${encodeURIComponent(numeroSus)}`)
    return data
  },
  async create(patient: PacienteInput): Promise<Paciente> {
    const { data } = await api.post<Paciente>('/pacientes', patient)
    return data
  },
  async update(id: number, patient: PacienteInput): Promise<Paciente> {
    const { data } = await api.put<Paciente>(`/pacientes/${id}`, patient)
    return data
  },
}

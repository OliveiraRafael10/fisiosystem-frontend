import { clienteApi } from '../api/clienteApi'
import type { Paciente, PacienteInput } from '../types/modelos'

export const patientService = {
  async list(): Promise<Paciente[]> {
    const { data } = await clienteApi.get<Paciente[]>('/pacientes')
    return data
  },
  async search(nome: string): Promise<Paciente[]> {
    const { data } = await clienteApi.get<Paciente[]>('/pacientes/buscar', { params: { nome } })
    return data
  },
  async getBySus(numeroSus: string): Promise<Paciente> {
    const { data } = await clienteApi.get<Paciente>(`/pacientes/sus/${encodeURIComponent(numeroSus)}`)
    return data
  },
  async create(patient: PacienteInput): Promise<Paciente> {
    const { data } = await clienteApi.post<Paciente>('/pacientes', patient)
    return data
  },
  async update(id: number, patient: PacienteInput): Promise<Paciente> {
    const { data } = await clienteApi.put<Paciente>(`/pacientes/${id}`, patient)
    return data
  },
}

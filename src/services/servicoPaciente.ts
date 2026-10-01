import { clienteApi } from '../api/clienteApi'
import type { Paciente, PacienteInput } from '../types/modelos'

export const servicoPaciente = {
  async listar(): Promise<Paciente[]> {
    const { data: dados } = await clienteApi.get<Paciente[]>('/pacientes')
    return dados
  },
  async buscar(nome: string): Promise<Paciente[]> {
    const { data: dados } = await clienteApi.get<Paciente[]>('/pacientes/buscar', {
      params: { nome },
    })
    return dados
  },
  async obterPorSus(numeroSus: string): Promise<Paciente> {
    const { data: dados } = await clienteApi.get<Paciente>(
      `/pacientes/sus/${encodeURIComponent(numeroSus)}`,
    )
    return dados
  },
  async criar(paciente: PacienteInput): Promise<Paciente> {
    const { data: dados } = await clienteApi.post<Paciente>('/pacientes', paciente)
    return dados
  },
  async atualizar(id: number, paciente: PacienteInput): Promise<Paciente> {
    const { data: dados } = await clienteApi.put<Paciente>(`/pacientes/${id}`, paciente)
    return dados
  },
}

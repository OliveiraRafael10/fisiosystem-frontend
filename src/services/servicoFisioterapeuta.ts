import { clienteApi } from '../api/clienteApi'
import type { Fisioterapeuta } from '../types/modelos'

type FisioterapeutaInput = Pick<Fisioterapeuta, 'nome' | 'crefito' | 'telefone'>

export const servicoFisioterapeuta = {
  async listar(): Promise<Fisioterapeuta[]> {
    const { data: dados } = await clienteApi.get<Fisioterapeuta[]>('/fisioterapeuta')
    return dados
  },
  async list(): Promise<Fisioterapeuta[]> {
    return servicoFisioterapeuta.listar()
  },
  async criar(fisioterapeuta: FisioterapeutaInput): Promise<Fisioterapeuta> {
    const { data: dados } = await clienteApi.post<Fisioterapeuta>('/fisioterapeuta', fisioterapeuta)
    return dados
  },
  async atualizar(id: number, fisioterapeuta: FisioterapeutaInput): Promise<Fisioterapeuta> {
    const { data: dados } = await clienteApi.put<Fisioterapeuta>(
      `/fisioterapeuta/${id}`,
      fisioterapeuta,
    )
    return dados
  },
  async ativar(id: number): Promise<Fisioterapeuta> {
    const { data: dados } = await clienteApi.put<Fisioterapeuta>(`/fisioterapeuta/${id}/ativar`)
    return dados
  },
  async inativar(id: number): Promise<Fisioterapeuta> {
    const { data: dados } = await clienteApi.put<Fisioterapeuta>(`/fisioterapeuta/${id}/inativar`)
    return dados
  },
}

import { clienteApi } from '../api/clienteApi'
import type {
  Consulta,
  ConsultaInput,
  IndicadoresConsulta,
  StatusConsulta,
  TaxaFaltas,
} from '../types/modelos'

export const servicoConsulta = {
  async listar(): Promise<Consulta[]> {
    const { data: dados } = await clienteApi.get<Consulta[]>('/consultas')
    return dados
  },
  async list(): Promise<Consulta[]> {
    return servicoConsulta.listar()
  },
  async agenda(dataConsulta: string): Promise<Consulta[]> {
    const { data: dados } = await clienteApi.get<Consulta[]>('/consultas/agenda', {
      params: { data: dataConsulta },
    })
    return dados
  },
  async criar(consulta: ConsultaInput): Promise<Consulta> {
    const { data: dados } = await clienteApi.post<Consulta>('/consultas', consulta)
    return dados
  },
  async create(consulta: ConsultaInput): Promise<Consulta> {
    return servicoConsulta.criar(consulta)
  },
  async porStatus(status: StatusConsulta): Promise<Consulta[]> {
    const { data: dados } = await clienteApi.get<Consulta[]>(`/consultas/status/${status}`)
    return dados
  },
  async reagendar(id: number, novaDataHora: string): Promise<Consulta> {
    const { data: dados } = await clienteApi.put<Consulta>(`/consultas/${id}/reagendar`, {
      novaDataHora,
    })
    return dados
  },
  async realizar(
    id: number,
    dadosConsulta: { diagnostico: string; procedimentos: string; conduta: string },
  ): Promise<Consulta> {
    const { data: dados } = await clienteApi.put<Consulta>(
      `/consultas/${id}/realizar`,
      dadosConsulta,
    )
    return dados
  },
  async cancelar(id: number, observacao: string): Promise<Consulta> {
    const { data: dados } = await clienteApi.put<Consulta>(`/consultas/${id}/cancelar`, {
      observacao,
    })
    return dados
  },
  async registrarFalta(id: number, observacao: string): Promise<Consulta> {
    const { data: dados } = await clienteApi.put<Consulta>(`/consultas/${id}/falta`, { observacao })
    return dados
  },
  async obterIndicadores(): Promise<IndicadoresConsulta> {
    const { data: dados } = await clienteApi.get<IndicadoresConsulta>('/consultas/indicadores')
    return dados
  },
  async indicators(): Promise<IndicadoresConsulta> {
    return servicoConsulta.obterIndicadores()
  },
  async obterIndicadoresPeriodo(dataInicio: string, dataFim: string): Promise<IndicadoresConsulta> {
    const { data: dados } = await clienteApi.get<IndicadoresConsulta>(
      '/consultas/indicadores/periodo',
      {
        params: { dataInicio, dataFim },
      },
    )
    return dados
  },
  async obterTaxaFaltas(dataInicio: string, dataFim: string): Promise<TaxaFaltas> {
    const { data: dados } = await clienteApi.get<TaxaFaltas>('/consultas/indicadores/taxa-faltas', {
      params: { dataInicio, dataFim },
    })
    return dados
  },
}

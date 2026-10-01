import { clienteApi } from '../api/clienteApi'
import type {
  Encaminhamento,
  EncaminhamentoInput,
  IndicadoresEncaminhamento,
  IndicadoresPrioridade,
  Prioridade,
  StatusEncaminhamento,
} from '../types/modelos'

export const servicoEncaminhamento = {
  async listar(): Promise<Encaminhamento[]> {
    const { data: dados } = await clienteApi.get<Encaminhamento[]>('/encaminhamentos')
    return dados
  },
  async list(): Promise<Encaminhamento[]> {
    return servicoEncaminhamento.listar()
  },
  async listarFila(): Promise<Encaminhamento[]> {
    const { data: dados } = await clienteApi.get<Encaminhamento[]>('/encaminhamentos/fila')
    return dados
  },
  async queue(): Promise<Encaminhamento[]> {
    return servicoEncaminhamento.listarFila()
  },
  async criar(encaminhamento: EncaminhamentoInput): Promise<Encaminhamento> {
    const { data: dados } = await clienteApi.post<Encaminhamento>(
      '/encaminhamentos',
      encaminhamento,
    )
    return dados
  },
  async create(encaminhamento: EncaminhamentoInput): Promise<Encaminhamento> {
    return servicoEncaminhamento.criar(encaminhamento)
  },
  async porStatus(status: StatusEncaminhamento): Promise<Encaminhamento[]> {
    const { data: dados } = await clienteApi.get<Encaminhamento[]>(
      `/encaminhamentos/status/${status}`,
    )
    return dados
  },
  async porPrioridade(prioridade: Prioridade): Promise<Encaminhamento[]> {
    const { data: dados } = await clienteApi.get<Encaminhamento[]>(
      `/encaminhamentos/prioridade/${prioridade}`,
    )
    return dados
  },
  async assumir(id: number, fisioterapeutaId: number): Promise<Encaminhamento> {
    const { data: dados } = await clienteApi.put<Encaminhamento>(
      `/encaminhamentos/${id}/assumir`,
      undefined,
      {
        params: { fisioterapeutaId },
      },
    )
    return dados
  },
  async retirar(id: number, motivo: string): Promise<Encaminhamento> {
    const { data: dados } = await clienteApi.put<Encaminhamento>(`/encaminhamentos/${id}/retirar`, {
      motivo,
    })
    return dados
  },
  async darAlta(id: number): Promise<Encaminhamento> {
    const { data: dados } = await clienteApi.put<Encaminhamento>(`/encaminhamentos/${id}/alta`)
    return dados
  },
  async obterIndicadores(): Promise<IndicadoresEncaminhamento> {
    const { data: dados } = await clienteApi.get<IndicadoresEncaminhamento>(
      '/encaminhamentos/indicadoresStatus',
    )
    return dados
  },
  async indicators(): Promise<IndicadoresEncaminhamento> {
    return servicoEncaminhamento.obterIndicadores()
  },
  async obterIndicadoresPrioridadeFila(): Promise<IndicadoresPrioridade> {
    const { data: dados } = await clienteApi.get<IndicadoresPrioridade>(
      '/encaminhamentos/indicadores/fila-prioridade',
    )
    return dados
  },
  async listarFilaPriorityIndicators(): Promise<IndicadoresPrioridade> {
    return servicoEncaminhamento.obterIndicadoresPrioridadeFila()
  },
  async queuePriorityIndicators(): Promise<IndicadoresPrioridade> {
    return servicoEncaminhamento.obterIndicadoresPrioridadeFila()
  },
  async obterTempoMedioEspera(): Promise<number> {
    const { data: dados } = await clienteApi.get<number>(
      '/encaminhamentos/indicadores/tempo-medio-espera',
    )
    return dados
  },
}

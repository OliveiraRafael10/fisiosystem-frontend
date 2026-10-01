import axios from 'axios'
import type { CorpoErroApi } from '../types/modelos'

export const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/backend',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export function obterMensagemErroApi(erro: unknown) {
  if (axios.isAxiosError<CorpoErroApi>(erro)) {
    if (erro.response?.data?.mensagem) return erro.response.data.mensagem
    if (erro.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.'
    if (!erro.response)
      return 'Não foi possível conectar ao backend. Confirme se o Spring está rodando na porta 8080.'
  }
  return 'Não foi possível concluir a operação.'
}

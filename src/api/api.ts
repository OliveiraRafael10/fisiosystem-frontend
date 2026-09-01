import axios from 'axios'
import type { ApiErrorBody } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/backend',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.mensagem) return error.response.data.mensagem
    if (error.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.'
    if (!error.response) return 'Não foi possível conectar ao backend. Confirme se o Spring está rodando na porta 8080.'
  }
  return 'Não foi possível concluir a operação.'
}

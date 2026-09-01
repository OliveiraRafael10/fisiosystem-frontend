import { api } from '../api/api'
import type { Appointment } from '../types'

export const appointmentService = {
  async list(): Promise<Appointment[]> {
    const { data } = await api.get<Appointment[]>('/consultas')
    return data
  },
  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const { data } = await api.post<Appointment>('/consultas', appointment)
    return data
  },
}

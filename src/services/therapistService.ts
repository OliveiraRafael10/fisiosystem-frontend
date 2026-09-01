import { api } from '../api/api'
import type { Therapist } from '../types'

export const therapistService = {
  async list(): Promise<Therapist[]> {
    const { data } = await api.get<Therapist[]>('/fisioterapeutas')
    return data
  },
}

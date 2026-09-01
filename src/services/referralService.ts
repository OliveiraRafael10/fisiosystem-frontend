import { api } from '../api/api'
import type { Referral } from '../types'

export const referralService = {
  async list(): Promise<Referral[]> {
    const { data } = await api.get<Referral[]>('/encaminhamentos')
    return data
  },
  async create(referral: Omit<Referral, 'id'>): Promise<Referral> {
    const { data } = await api.post<Referral>('/encaminhamentos', referral)
    return data
  },
}

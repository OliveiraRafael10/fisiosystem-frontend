import { api } from '../api/api'
import type { Patient } from '../types'

export const patientService = {
  async list(): Promise<Patient[]> {
    const { data } = await api.get<Patient[]>('/pacientes')
    return data
  },
  async getById(id: number): Promise<Patient> {
    const { data } = await api.get<Patient>(`/pacientes/${id}`)
    return data
  },
  async create(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const { data } = await api.post<Patient>('/pacientes', patient)
    return data
  },
  async update(id: number, patient: Partial<Patient>): Promise<Patient> {
    const { data } = await api.put<Patient>(`/pacientes/${id}`, patient)
    return data
  },
}

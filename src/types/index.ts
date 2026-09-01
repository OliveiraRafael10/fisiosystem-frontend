export type PatientStatus = 'Em tratamento' | 'Aguardando' | 'Alta' | 'Inativo'
export type Priority = 'Alta' | 'Média' | 'Baixa'
export type ReferralStatus = 'Aguardando vaga' | 'Em tratamento' | 'Concluído'
export type AppointmentStatus = 'Confirmada' | 'Pendente' | 'Realizada' | 'Cancelada'

export interface Patient {
  id: number
  name: string
  cpf: string
  birthDate: string
  phone: string
  city: string
  status: PatientStatus
  lastVisit: string
  referrals: number
  initials: string
}

export interface Referral {
  id: number
  patientId: number
  patient: string
  specialty: string
  diagnosis: string
  origin: string
  priority: Priority
  status: ReferralStatus
  requestedAt: string
  waitDays: number
}

export interface Appointment {
  id: number
  patient: string
  therapist: string
  specialty: string
  date: string
  time: string
  duration: number
  status: AppointmentStatus
}

export interface Therapist {
  id: number
  name: string
  crefito: string
  specialty: string
  phone: string
  email: string
  status: 'Disponível' | 'Em atendimento' | 'Ausente'
  todayAppointments: number
  occupancy: number
  initials: string
  color: string
}

import type { Appointment, Patient, Referral, Therapist } from '../types'

export const patients: Patient[] = [
  { id: 1, name: 'Helena Martins', cpf: '123.456.789-01', birthDate: '1958-04-12', phone: '(11) 98721-4490', city: 'São Paulo', status: 'Em tratamento', lastVisit: 'Hoje, 08:00', referrals: 2, initials: 'HM' },
  { id: 2, name: 'Carlos Eduardo Souza', cpf: '987.654.321-02', birthDate: '1975-09-23', phone: '(11) 99830-1722', city: 'São Paulo', status: 'Em tratamento', lastVisit: 'Hoje, 09:20', referrals: 1, initials: 'CE' },
  { id: 3, name: 'Ana Paula Lima', cpf: '451.782.963-10', birthDate: '1969-01-08', phone: '(11) 97718-3619', city: 'Osasco', status: 'Aguardando', lastVisit: '28 ago 2026', referrals: 1, initials: 'AP' },
  { id: 4, name: 'Roberto Alves', cpf: '731.984.256-40', birthDate: '1981-07-17', phone: '(11) 95672-1438', city: 'Barueri', status: 'Em tratamento', lastVisit: '27 ago 2026', referrals: 3, initials: 'RA' },
  { id: 5, name: 'Joana Ferreira', cpf: '092.561.743-88', birthDate: '1952-11-30', phone: '(11) 98831-4527', city: 'São Paulo', status: 'Aguardando', lastVisit: '20 ago 2026', referrals: 1, initials: 'JF' },
  { id: 6, name: 'Marcos Vinícius Reis', cpf: '836.194.057-21', birthDate: '1992-03-14', phone: '(11) 96428-1307', city: 'Carapicuíba', status: 'Aguardando', lastVisit: '18 ago 2026', referrals: 1, initials: 'MV' },
  { id: 7, name: 'Elisa de Souza', cpf: '241.753.896-07', birthDate: '1947-08-02', phone: '(11) 97546-8021', city: 'São Paulo', status: 'Alta', lastVisit: '14 ago 2026', referrals: 2, initials: 'ES' },
  { id: 8, name: 'Pedro Henrique Melo', cpf: '647.201.938-53', birthDate: '1988-12-21', phone: '(11) 99861-5260', city: 'Osasco', status: 'Inativo', lastVisit: '02 jul 2026', referrals: 1, initials: 'PH' },
]

export const referrals: Referral[] = [
  { id: 1048, patientId: 5, patient: 'Joana Ferreira', specialty: 'Neurologia', diagnosis: 'Sequela pós-AVC', origin: 'UBS Vila Nova', priority: 'Alta', status: 'Aguardando vaga', requestedAt: '20 ago 2026', waitDays: 12 },
  { id: 1047, patientId: 6, patient: 'Marcos Vinícius Reis', specialty: 'Ortopedia', diagnosis: 'Lombalgia crônica', origin: 'AMA Central', priority: 'Alta', status: 'Aguardando vaga', requestedAt: '24 ago 2026', waitDays: 8 },
  { id: 1046, patientId: 3, patient: 'Ana Paula Lima', specialty: 'Neurologia', diagnosis: 'Doença de Parkinson', origin: 'Hospital Municipal', priority: 'Média', status: 'Aguardando vaga', requestedAt: '26 ago 2026', waitDays: 6 },
  { id: 1045, patientId: 1, patient: 'Helena Martins', specialty: 'Geriatria', diagnosis: 'Risco de quedas', origin: 'UBS Jardim Sul', priority: 'Média', status: 'Em tratamento', requestedAt: '12 ago 2026', waitDays: 0 },
  { id: 1044, patientId: 2, patient: 'Carlos Eduardo Souza', specialty: 'Ortopedia', diagnosis: 'Lesão de menisco', origin: 'Hospital Municipal', priority: 'Baixa', status: 'Em tratamento', requestedAt: '08 ago 2026', waitDays: 0 },
  { id: 1043, patientId: 4, patient: 'Roberto Alves', specialty: 'Traumato-ortopedia', diagnosis: 'Pós-operatório de LCA', origin: 'Hospital São Lucas', priority: 'Média', status: 'Em tratamento', requestedAt: '03 ago 2026', waitDays: 0 },
  { id: 1042, patientId: 7, patient: 'Elisa de Souza', specialty: 'Respiratória', diagnosis: 'Reabilitação pulmonar', origin: 'UBS Norte', priority: 'Baixa', status: 'Concluído', requestedAt: '15 jun 2026', waitDays: 0 },
]

export const appointments: Appointment[] = [
  { id: 301, patient: 'Helena Martins', therapist: 'Marina Andrade', specialty: 'Geriatria', date: '2026-09-01', time: '08:00', duration: 50, status: 'Confirmada' },
  { id: 302, patient: 'Carlos Eduardo Souza', therapist: 'Rafael Freitas', specialty: 'Ortopedia', date: '2026-09-01', time: '09:20', duration: 50, status: 'Confirmada' },
  { id: 303, patient: 'Ana Paula Lima', therapist: 'Marina Andrade', specialty: 'Neurologia', date: '2026-09-01', time: '10:40', duration: 50, status: 'Pendente' },
  { id: 304, patient: 'Roberto Alves', therapist: 'Henrique Costa', specialty: 'Traumato-ortopedia', date: '2026-09-01', time: '13:30', duration: 50, status: 'Confirmada' },
  { id: 305, patient: 'Marta Ribeiro', therapist: 'Rafael Freitas', specialty: 'Ortopedia', date: '2026-09-01', time: '14:40', duration: 50, status: 'Pendente' },
  { id: 306, patient: 'Sérgio Almeida', therapist: 'Clara Nunes', specialty: 'Respiratória', date: '2026-09-01', time: '16:00', duration: 50, status: 'Confirmada' },
  { id: 307, patient: 'Bianca Torres', therapist: 'Marina Andrade', specialty: 'Neurologia', date: '2026-09-02', time: '08:00', duration: 50, status: 'Confirmada' },
  { id: 308, patient: 'Luiz Antônio', therapist: 'Henrique Costa', specialty: 'Ortopedia', date: '2026-09-02', time: '09:20', duration: 50, status: 'Pendente' },
]

export const therapists: Therapist[] = [
  { id: 1, name: 'Marina Andrade', crefito: 'CREFITO-3 128540-F', specialty: 'Neurologia e Geriatria', phone: '(11) 99128-4410', email: 'marina@fisiosystem.com.br', status: 'Em atendimento', todayAppointments: 7, occupancy: 88, initials: 'MA', color: 'teal' },
  { id: 2, name: 'Rafael Freitas', crefito: 'CREFITO-3 142876-F', specialty: 'Ortopedia e Esportiva', phone: '(11) 98145-9021', email: 'rafael@fisiosystem.com.br', status: 'Disponível', todayAppointments: 6, occupancy: 75, initials: 'RF', color: 'blue' },
  { id: 3, name: 'Henrique Costa', crefito: 'CREFITO-3 119273-F', specialty: 'Traumato-ortopedia', phone: '(11) 97234-1187', email: 'henrique@fisiosystem.com.br', status: 'Em atendimento', todayAppointments: 5, occupancy: 63, initials: 'HC', color: 'orange' },
  { id: 4, name: 'Clara Nunes', crefito: 'CREFITO-3 154092-F', specialty: 'Fisioterapia Respiratória', phone: '(11) 99831-5604', email: 'clara@fisiosystem.com.br', status: 'Disponível', todayAppointments: 4, occupancy: 50, initials: 'CN', color: 'violet' },
]

export const monthlyPerformance = [
  { month: 'Mar', atendimentos: 286, altas: 18 },
  { month: 'Abr', atendimentos: 312, altas: 24 },
  { month: 'Mai', atendimentos: 298, altas: 22 },
  { month: 'Jun', atendimentos: 354, altas: 29 },
  { month: 'Jul', atendimentos: 371, altas: 31 },
  { month: 'Ago', atendimentos: 402, altas: 38 },
]

export const specialtyData = [
  { name: 'Ortopedia', value: 42, color: '#167f79' },
  { name: 'Neurologia', value: 27, color: '#5c8fc1' },
  { name: 'Geriatria', value: 18, color: '#d18b57' },
  { name: 'Respiratória', value: 13, color: '#806db4' },
]

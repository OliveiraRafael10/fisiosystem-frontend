import { CalendarDays, Clock3 } from 'lucide-react'
import { formatDate } from '../../lib/domain'
import { ActionSuccessModal } from '../ui/ActionSuccessModal'

interface AppointmentScheduledModalProps {
  dateTime: string | null
  onClose: () => void
}

export function AppointmentScheduledModal({ dateTime, onClose }: AppointmentScheduledModalProps) {
  const [date = '', rawTime = ''] = dateTime?.split('T') ?? []
  const time = rawTime.slice(0, 5)

  return (
    <ActionSuccessModal
      open={Boolean(dateTime)}
      title="Consulta agendada com sucesso"
      description="O atendimento foi incluído na agenda clínica."
      onClose={onClose}
      message="A consulta já está disponível para acompanhamento na agenda."
      actionLabel="Voltar para consultas"
      details={[
        { icon: CalendarDays, label: 'Data', value: formatDate(date) },
        { icon: Clock3, label: 'Horário', tone: 'blue', value: time || '—' },
      ]}
    />
  )
}

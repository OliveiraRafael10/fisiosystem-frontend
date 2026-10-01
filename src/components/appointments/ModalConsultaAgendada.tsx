import { CalendarDays, Clock3 } from 'lucide-react'
import { formatarData } from '../../lib/dominio'
import { ModalAcaoConcluida } from '../ui/ModalAcaoConcluida'

interface ModalConsultaAgendadaProps {
  dateTime: string | null
  onClose: () => void
}

export function ModalConsultaAgendada({ dateTime, onClose }: ModalConsultaAgendadaProps) {
  const [date = '', rawTime = ''] = dateTime?.split('T') ?? []
  const time = rawTime.slice(0, 5)

  return (
    <ModalAcaoConcluida
      open={Boolean(dateTime)}
      title="Consulta agendada com sucesso"
      description="O atendimento foi incluído na agenda clínica."
      onClose={onClose}
      message="A consulta já está disponível para acompanhamento na agenda."
      actionLabel="Voltar para consultas"
      details={[
        { icon: CalendarDays, label: 'Data', value: formatarData(date) },
        { icon: Clock3, label: 'Horário', tone: 'blue', value: time || '—' },
      ]}
    />
  )
}

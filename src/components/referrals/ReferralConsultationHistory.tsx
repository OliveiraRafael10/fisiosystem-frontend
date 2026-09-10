import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, ChevronDown, Clock3, RefreshCw, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatDateTime, localDate } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'

interface ReferralConsultationHistoryProps {
  referralId: number
  excludeAppointmentId?: number
  beforeDateTime?: string
}

export function ReferralConsultationHistory({ referralId, excludeAppointmentId, beforeDateTime }: ReferralConsultationHistoryProps) {
  const [open, setOpen] = useState(false)
  const appointments = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentService.list,
  })

  const completed = useMemo(() => {
    const today = localDate()
    return (appointments.data ?? [])
      .filter((item) => item.encaminhamentoId === referralId && item.status === 'REALIZADA' && item.id !== excludeAppointmentId && item.dataHora.slice(0, 10) <= today && (!beforeDateTime || item.dataHora < beforeDateTime))
      .sort((a, b) => a.dataHora.localeCompare(b.dataHora))
  }, [appointments.data, beforeDateTime, excludeAppointmentId, referralId])

  const countLabel = completed.length === 1 ? '1 consulta realizada' : `${completed.length} consultas realizadas`

  return (
    <section className={`referral-consultations ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="referral-consultations-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={`referral-consultations-${referralId}`}
      >
        <span className="referral-consultations-icon"><CalendarCheck size={21} /></span>
        <span className="referral-consultations-copy">
          <small>{beforeDateTime ? 'Registros anteriores deste encaminhamento' : 'Consultas realizadas até hoje'}</small>
          <strong>{appointments.isLoading ? 'Carregando histórico...' : countLabel}</strong>
        </span>
        <span className="referral-consultations-action">{open ? 'Ocultar registros' : beforeDateTime ? 'Ver registros anteriores' : 'Ver histórico'} <ChevronDown size={18} /></span>
      </button>

      {open && (
        <div className="referral-consultations-history" id={`referral-consultations-${referralId}`}>
          <header>
            <div><strong>Linha do tempo de atendimentos</strong><span>{beforeDateTime ? 'Consultas realizadas antes deste atendimento' : 'Da primeira consulta à mais recente'}</span></div>
            <span>{completed.length}</span>
          </header>

          {appointments.isLoading && <div className="referral-history-state"><Clock3 size={22} /><strong>Carregando consultas...</strong></div>}

          {appointments.isError && (
            <div className="referral-history-state is-error">
              <RefreshCw size={22} />
              <div><strong>Não foi possível carregar o histórico</strong><button type="button" onClick={() => void appointments.refetch()}>Tentar novamente</button></div>
            </div>
          )}

          {!appointments.isLoading && !appointments.isError && completed.length === 0 && (
            <div className="referral-history-state"><CalendarCheck size={24} /><div><strong>Nenhuma consulta realizada</strong><p>Os atendimentos concluídos aparecerão aqui.</p></div></div>
          )}

          {!appointments.isLoading && !appointments.isError && completed.length > 0 && (
            <ol className="referral-history-list">
              {completed.map((appointment, index) => (
                <li key={appointment.id}>
                  <span className="referral-history-marker">{index + 1}</span>
                  <article>
                    <div className="referral-history-heading">
                      <div><strong>Consulta #{appointment.id}</strong><time dateTime={appointment.dataHora}>{formatDateTime(appointment.dataHora)}</time></div>
                      <span><Stethoscope size={15} /> {appointment.fisioterapeutaNome || 'Profissional não informado'}</span>
                    </div>
                    {(appointment.diagnostico || appointment.procedimentos || appointment.conduta) && (
                      <dl>
                        {appointment.diagnostico && <div><dt>Diagnóstico</dt><dd>{appointment.diagnostico}</dd></div>}
                        {appointment.procedimentos && <div><dt>Procedimentos</dt><dd>{appointment.procedimentos}</dd></div>}
                        {appointment.conduta && <div><dt>Conduta</dt><dd>{appointment.conduta}</dd></div>}
                      </dl>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  )
}

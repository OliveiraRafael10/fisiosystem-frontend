import { useQuery } from '@tanstack/react-query'
import {
  CalendarClock,
  CalendarDays,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  LayoutGrid,
  List,
  Plus,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ModaisAcoesRapidasConsulta,
  type AppointmentQuickAction,
  type AppointmentQuickActionSuccess,
} from '../../components/appointments/ModaisAcoesRapidasConsulta'
import { ModalAcaoConcluida } from '../../components/ui/ModalAcaoConcluida'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { formatarData, obterRotuloStatusConsulta, iniciais, dataLocal } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import type { Consulta } from '../../types/modelos'

interface SelectedQuickAction {
  appointment: Consulta
  type: AppointmentQuickAction
}

function weekAround(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)
  const monday = new Date(date)
  const weekday = date.getDay() || 7
  monday.setDate(date.getDate() - weekday + 1)
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return {
      date: dataLocal(day),
      week: day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase(),
      day: String(day.getDate()).padStart(2, '0'),
    }
  })
}

export function PaginaConsultas() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(dataLocal())
  const [view, setView] = useState<'agenda' | 'lista'>('agenda')
  const [quickAction, setQuickAction] = useState<SelectedQuickAction | null>(null)
  const [completedAction, setCompletedAction] = useState<AppointmentQuickActionSuccess | null>(null)
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: servicoConsulta.listar })
  const agenda = useQuery({
    queryKey: ['appointments', 'agenda', selectedDate],
    queryFn: () => servicoConsulta.agenda(selectedDate),
  })
  const week = useMemo(() => weekAround(selectedDate), [selectedDate])
  const selectedAppointments = agenda.data ?? []

  function openQuickAction(appointment: Consulta, type: AppointmentQuickAction) {
    setQuickAction({ appointment, type })
  }

  function moveWeek(amount: number) {
    const date = new Date(`${selectedDate}T12:00:00`)
    date.setDate(date.getDate() + amount * 7)
    setSelectedDate(dataLocal(date))
  }

  if (appointments.isLoading || agenda.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Sincronizando a agenda..." />
      </section>
    )
  if (appointments.isError || agenda.isError)
    return (
      <section className="page-content">
        <ApiError
          error={appointments.error ?? agenda.error}
          retry={() => {
            void appointments.refetch()
            void agenda.refetch()
          }}
        />
      </section>
    )

  const currentPath = `${location.pathname}${location.search}`
  return (
    <section className="page-content">
      <CabecalhoPagina
        eyebrow="AGENDA CLÍNICA"
        title="Consultas"
        description="Agendamento e registros clínicos conectados às regras do backend."
        actions={
          <button
            className="primary-button page-primary"
            onClick={() =>
              navigate(`/consultas/nova?data=${selectedDate}`, { state: { from: currentPath } })
            }
          >
            <Plus size={18} /> Agendar consulta
          </button>
        }
      />
      <div className="calendar-toolbar">
        <div className="calendar-navigation">
          <button onClick={() => moveWeek(-1)}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <strong>
              {new Date(`${week[0].date}T12:00:00`).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}{' '}
              —{' '}
              {new Date(`${week[4].date}T12:00:00`).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </strong>
            <span>{new Date(`${selectedDate}T12:00:00`).getFullYear()}</span>
          </div>
          <button onClick={() => moveWeek(1)}>
            <ChevronRight size={18} />
          </button>
          <button className="today-button" onClick={() => setSelectedDate(dataLocal())}>
            Hoje
          </button>
        </div>
        <div className="view-switch">
          <button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}>
            <LayoutGrid size={16} /> Agenda
          </button>
          <button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}>
            <List size={16} /> Lista
          </button>
        </div>
      </div>
      <div className="week-selector">
        {week.map((day) => (
          <button
            className={selectedDate === day.date ? 'selected' : ''}
            onClick={() => setSelectedDate(day.date)}
            key={day.date}
          >
            <span>{day.week}</span>
            <strong>{day.day}</strong>
            <i>
              {appointments.data?.filter((item) => item.dataHora.startsWith(day.date)).length ||
                '—'}
            </i>
          </button>
        ))}
      </div>
      <div className="agenda-layout">
        <section className="data-panel agenda-main">
          <div className="agenda-header">
            <div>
              <h2>
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                })}
              </h2>
              <p>{selectedAppointments.length} atendimentos programados</p>
            </div>
            <span className="capacity-badge">
              <UsersRound size={15} />{' '}
              {new Set(selectedAppointments.map((item) => item.fisioterapeutaId)).size}{' '}
              profissionais
            </span>
          </div>
          {selectedAppointments.length ? (
            <div className={`consultation-list ${view === 'lista' ? 'compact-list' : ''}`}>
              {selectedAppointments.map((item, index) => (
                <article
                  className={`consultation-card ${item.status === 'AGENDADA' ? 'has-quick-actions' : ''}`}
                  key={item.id}
                >
                  <div className="consultation-time">
                    <strong>{item.dataHora?.slice(11, 16) || '—'}</strong>
                    <span>Consulta #{item.id}</span>
                  </div>
                  <div className={`consultation-color color-${index % 4}`} />
                  <div className="consultation-patient">
                    <span className="patient-avatar large">{iniciais(item.pacienteNome)}</span>
                    <div>
                      <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                      <span>Encaminhamento #{item.encaminhamentoId}</span>
                    </div>
                  </div>
                  <div className="consultation-therapist">
                    <span>Profissional</span>
                    <strong>{item.fisioterapeutaNome || 'Não informado'}</strong>
                  </div>
                  {item.status === 'AGENDADA' ? (
                    <div className="consultation-actions">
                      <button
                        type="button"
                        className="consultation-action consultation-action-open"
                        onClick={() =>
                          navigate(`/consultas/${item.id}`, { state: { from: currentPath } })
                        }
                      >
                        <Eye size={16} /> Abrir
                      </button>
                      <button
                        type="button"
                        className="consultation-action consultation-action-reschedule"
                        onClick={() => openQuickAction(item, 'reschedule')}
                      >
                        <CalendarClock size={16} /> Remarcar
                      </button>
                      <button
                        type="button"
                        className="consultation-action consultation-action-cancel"
                        onClick={() => openQuickAction(item, 'cancel')}
                      >
                        <CalendarX size={16} /> Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <SeloStatus>{obterRotuloStatusConsulta(item.status)}</SeloStatus>
                      <button
                        className="secondary-button small"
                        onClick={() =>
                          navigate(`/consultas/${item.id}`, { state: { from: currentPath } })
                        }
                      >
                        Abrir
                      </button>
                    </>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state agenda-empty">
              <CalendarDays size={28} />
              <strong>Agenda livre neste dia</strong>
              <p>Selecione outro dia ou agende um atendimento.</p>
              <button
                className="primary-button"
                onClick={() =>
                  navigate(`/consultas/nova?data=${selectedDate}`, { state: { from: currentPath } })
                }
              >
                Agendar consulta
              </button>
            </div>
          )}
        </section>
        <aside className="agenda-side">
          <section className="panel day-overview">
            <div className="panel-heading">
              <div>
                <h2>Resumo do dia</h2>
                <p>Status dos atendimentos</p>
              </div>
            </div>
            <div className="radial-progress">
              <div
                style={
                  {
                    '--progress': `${Math.min(100, selectedAppointments.length * 8)}%`,
                  } as React.CSSProperties
                }
              >
                <strong>{selectedAppointments.length}</strong>
                <span>consultas</span>
              </div>
            </div>
            <div className="overview-line">
              <span>
                <i className="legend confirmed" /> Agendadas
              </span>
              <strong>
                {selectedAppointments.filter((item) => item.status === 'AGENDADA').length}
              </strong>
            </div>
            <div className="overview-line">
              <span>
                <i className="legend pending" /> Realizadas
              </span>
              <strong>
                {selectedAppointments.filter((item) => item.status === 'REALIZADA').length}
              </strong>
            </div>
            <div className="overview-line">
              <span>
                <i className="legend free" /> Faltas/canceladas
              </span>
              <strong>
                {
                  selectedAppointments.filter((item) =>
                    ['FALTA', 'CANCELADA'].includes(item.status),
                  ).length
                }
              </strong>
            </div>
          </section>
          <section className="panel next-slot">
            <span>
              <Clock3 size={19} />
            </span>
            <div>
              <small>INTEGRAÇÃO ATIVA</small>
              <strong>Agenda do Spring</strong>
              <p>Dados atualizados automaticamente</p>
            </div>
          </section>
        </aside>
      </div>

      <ModaisAcoesRapidasConsulta
        key={quickAction ? `${quickAction.appointment.id}-${quickAction.type}` : 'closed'}
        action={quickAction?.type ?? null}
        appointment={quickAction?.appointment ?? null}
        onClose={() => setQuickAction(null)}
        onSuccess={(result) => {
          setQuickAction(null)
          setCompletedAction(result)
        }}
      />
      <ModalAcaoConcluida
        open={Boolean(completedAction)}
        title={
          completedAction?.kind === 'rescheduled'
            ? 'Consulta remarcada com sucesso'
            : completedAction?.kind === 'absence'
              ? 'Falta registrada com sucesso'
              : 'Consulta cancelada com sucesso'
        }
        description="A agenda foi atualizada com as informações confirmadas pelo sistema."
        message={
          completedAction?.kind === 'rescheduled'
            ? 'O novo horário já está disponível na agenda clínica.'
            : 'A ocorrência foi registrada e a agenda já está atualizada.'
        }
        actionLabel="Continuar na agenda"
        onClose={() => setCompletedAction(null)}
        details={
          completedAction?.kind === 'rescheduled'
            ? [
                {
                  icon: CalendarDays,
                  label: 'Nova data',
                  value: formatarData(completedAction.appointment.dataHora.slice(0, 10)),
                },
                {
                  icon: Clock3,
                  label: 'Novo horário',
                  tone: 'blue',
                  value: completedAction.appointment.dataHora.slice(11, 16),
                },
              ]
            : completedAction
              ? [
                  {
                    icon: UsersRound,
                    label: 'Paciente',
                    value: completedAction.appointment.pacienteNome || 'Não informado',
                  },
                  {
                    icon: CalendarDays,
                    label: 'Consulta',
                    tone: 'orange',
                    value: `#${completedAction.appointment.id}`,
                  },
                ]
              : []
        }
      />
    </section>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, CalendarDays, CalendarX, ChevronLeft, ChevronRight, Clock3, Eye, LayoutGrid, List, Plus, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { getStatusConsultaLabel, initials, localDate } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import type { Consulta } from '../../types'

type QuickAction = 'reschedule' | 'cancel'
type CancellationKind = 'cancel' | 'absence'

function weekAround(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)
  const monday = new Date(date)
  const weekday = date.getDay() || 7
  monday.setDate(date.getDate() - weekday + 1)
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return { date: localDate(day), week: day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase(), day: String(day.getDate()).padStart(2, '0') }
  })
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(localDate())
  const [view, setView] = useState<'agenda' | 'lista'>('agenda')
  const [quickAppointment, setQuickAppointment] = useState<Consulta | null>(null)
  const [quickAction, setQuickAction] = useState<QuickAction | null>(null)
  const [newDateTime, setNewDateTime] = useState('')
  const [cancellationKind, setCancellationKind] = useState<CancellationKind>('cancel')
  const [observation, setObservation] = useState('')
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: appointmentService.list })
  const agenda = useQuery({ queryKey: ['appointments', 'agenda', selectedDate], queryFn: () => appointmentService.agenda(selectedDate) })
  const week = useMemo(() => weekAround(selectedDate), [selectedDate])
  const selectedAppointments = agenda.data ?? []

  const quickMutation = useMutation({
    mutationFn: async () => {
      if (!quickAppointment || !quickAction) throw new Error('Consulta não selecionada.')
      if (quickAction === 'reschedule') return appointmentService.reschedule(quickAppointment.id, newDateTime)
      if (cancellationKind === 'absence') return appointmentService.markAbsence(quickAppointment.id, observation.trim())
      return appointmentService.cancel(quickAppointment.id, observation.trim())
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setQuickAppointment(null)
      setQuickAction(null)
      setNewDateTime('')
      setObservation('')
      setCancellationKind('cancel')
    },
  })

  function openQuickAction(appointment: Consulta, action: QuickAction) {
    quickMutation.reset()
    setQuickAppointment(appointment)
    setQuickAction(action)
    setNewDateTime(action === 'reschedule' ? appointment.dataHora.slice(0, 16) : '')
    setCancellationKind('cancel')
    setObservation('')
  }

  function closeQuickAction() {
    if (quickMutation.isPending) return
    quickMutation.reset()
    setQuickAppointment(null)
    setQuickAction(null)
    setNewDateTime('')
    setObservation('')
    setCancellationKind('cancel')
  }

  function moveWeek(amount: number) {
    const date = new Date(`${selectedDate}T12:00:00`)
    date.setDate(date.getDate() + amount * 7)
    setSelectedDate(localDate(date))
  }

  if (appointments.isLoading || agenda.isLoading) return <section className="page-content"><ApiLoading label="Sincronizando a agenda..." /></section>
  if (appointments.isError || agenda.isError) return <section className="page-content"><ApiError error={appointments.error ?? agenda.error} retry={() => { void appointments.refetch(); void agenda.refetch() }} /></section>

  const currentPath = `${location.pathname}${location.search}`
  return (
    <section className="page-content">
      <PageHeader eyebrow="AGENDA CLÍNICA" title="Consultas" description="Agendamento e registros clínicos conectados às regras do backend." actions={<button className="primary-button page-primary" onClick={() => navigate(`/consultas/nova?data=${selectedDate}`, { state: { from: currentPath } })}><Plus size={18} /> Agendar consulta</button>} />
      <div className="calendar-toolbar"><div className="calendar-navigation"><button onClick={() => moveWeek(-1)}><ChevronLeft size={18} /></button><div><strong>{new Date(`${week[0].date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} — {new Date(`${week[4].date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</strong><span>{new Date(`${selectedDate}T12:00:00`).getFullYear()}</span></div><button onClick={() => moveWeek(1)}><ChevronRight size={18} /></button><button className="today-button" onClick={() => setSelectedDate(localDate())}>Hoje</button></div><div className="view-switch"><button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}><LayoutGrid size={16} /> Agenda</button><button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}><List size={16} /> Lista</button></div></div>
      <div className="week-selector">{week.map((day) => <button className={selectedDate === day.date ? 'selected' : ''} onClick={() => setSelectedDate(day.date)} key={day.date}><span>{day.week}</span><strong>{day.day}</strong><i>{appointments.data?.filter((item) => item.dataHora.startsWith(day.date)).length || '—'}</i></button>)}</div>
      <div className="agenda-layout">
        <section className="data-panel agenda-main"><div className="agenda-header"><div><h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h2><p>{selectedAppointments.length} atendimentos programados</p></div><span className="capacity-badge"><UsersRound size={15} /> {new Set(selectedAppointments.map((item) => item.fisioterapeutaId)).size} profissionais</span></div>
          {selectedAppointments.length ? (
            <div className={`consultation-list ${view === 'lista' ? 'compact-list' : ''}`}>
              {selectedAppointments.map((item, index) => (
                <article className={`consultation-card ${item.status === 'AGENDADA' ? 'has-quick-actions' : ''}`} key={item.id}>
                  <div className="consultation-time"><strong>{item.dataHora?.slice(11, 16) || '—'}</strong><span>Consulta #{item.id}</span></div>
                  <div className={`consultation-color color-${index % 4}`} />
                  <div className="consultation-patient"><span className="patient-avatar large">{initials(item.pacienteNome)}</span><div><strong>{item.pacienteNome || 'Paciente não informado'}</strong><span>Encaminhamento #{item.encaminhamentoId}</span></div></div>
                  <div className="consultation-therapist"><span>Profissional</span><strong>{item.fisioterapeutaNome || 'Não informado'}</strong></div>
                  {item.status === 'AGENDADA' ? (
                    <div className="consultation-actions">
                      <button type="button" className="consultation-action consultation-action-open" onClick={() => navigate(`/consultas/${item.id}`, { state: { from: currentPath } })}><Eye size={16} /> Abrir</button>
                      <button type="button" className="consultation-action consultation-action-reschedule" onClick={() => openQuickAction(item, 'reschedule')}><CalendarClock size={16} /> Remarcar</button>
                      <button type="button" className="consultation-action consultation-action-cancel" onClick={() => openQuickAction(item, 'cancel')}><CalendarX size={16} /> Cancelar</button>
                    </div>
                  ) : (
                    <><StatusBadge>{getStatusConsultaLabel(item.status)}</StatusBadge><button className="secondary-button small" onClick={() => navigate(`/consultas/${item.id}`, { state: { from: currentPath } })}>Abrir</button></>
                  )}
                </article>
              ))}
            </div>
          ) : <div className="empty-state agenda-empty"><CalendarDays size={28} /><strong>Agenda livre neste dia</strong><p>Selecione outro dia ou agende um atendimento.</p><button className="primary-button" onClick={() => navigate(`/consultas/nova?data=${selectedDate}`, { state: { from: currentPath } })}>Agendar consulta</button></div>}
        </section>
        <aside className="agenda-side"><section className="panel day-overview"><div className="panel-heading"><div><h2>Resumo do dia</h2><p>Status dos atendimentos</p></div></div><div className="radial-progress"><div style={{ '--progress': `${Math.min(100, selectedAppointments.length * 8)}%` } as React.CSSProperties}><strong>{selectedAppointments.length}</strong><span>consultas</span></div></div><div className="overview-line"><span><i className="legend confirmed" /> Agendadas</span><strong>{selectedAppointments.filter((item) => item.status === 'AGENDADA').length}</strong></div><div className="overview-line"><span><i className="legend pending" /> Realizadas</span><strong>{selectedAppointments.filter((item) => item.status === 'REALIZADA').length}</strong></div><div className="overview-line"><span><i className="legend free" /> Faltas/canceladas</span><strong>{selectedAppointments.filter((item) => ['FALTA', 'CANCELADA'].includes(item.status)).length}</strong></div></section><section className="panel next-slot"><span><Clock3 size={19} /></span><div><small>INTEGRAÇÃO ATIVA</small><strong>Agenda do Spring</strong><p>Dados atualizados automaticamente</p></div></section></aside>
      </div>

      <Modal open={quickAction === 'reschedule'} title="Remarcar consulta" description={quickAppointment ? `${quickAppointment.pacienteNome} • Consulta #${quickAppointment.id}` : undefined} onClose={closeQuickAction} size="wide">
        <form className="quick-action-modal" onSubmit={(event) => { event.preventDefault(); quickMutation.mutate() }}>
          <div className="quick-action-summary">
            <span className="quick-action-summary-icon"><CalendarClock size={22} /></span>
            <div><span>Horário atual</span><strong>{quickAppointment ? new Date(quickAppointment.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : '—'}</strong></div>
          </div>
          <div className="form-section quick-action-form-section">
            <label className="field"><span>Nova data e horário</span><input type="datetime-local" value={newDateTime} onChange={(event) => setNewDateTime(event.target.value)} required /></label>
          </div>
          <MutationError error={quickMutation.error} />
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={closeQuickAction} disabled={quickMutation.isPending}>Voltar</button>
            <button type="submit" className="primary-button" disabled={!newDateTime || quickMutation.isPending}>{quickMutation.isPending ? 'Remarcando...' : 'Confirmar remarcação'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={quickAction === 'cancel'} title="Registrar cancelamento" description={quickAppointment ? `${quickAppointment.pacienteNome} • Consulta #${quickAppointment.id}` : undefined} onClose={closeQuickAction} size="wide">
        <form className="quick-action-modal" onSubmit={(event) => { event.preventDefault(); quickMutation.mutate() }}>
          <div className="quick-action-summary quick-action-summary-danger">
            <span className="quick-action-summary-icon"><CalendarX size={22} /></span>
            <div><span>Consulta agendada para</span><strong>{quickAppointment ? new Date(quickAppointment.dataHora).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : '—'}</strong></div>
          </div>
          <div className="form-section quick-action-form-section quick-action-fields">
            <label className="field"><span>Tipo de ocorrência</span><select value={cancellationKind} onChange={(event) => setCancellationKind(event.target.value as CancellationKind)}><option value="cancel">Cancelamento</option><option value="absence">Falta do paciente</option></select></label>
            <label className="field"><span>Observação</span><textarea value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Registre o motivo e outras informações relevantes" rows={4} required /></label>
          </div>
          <MutationError error={quickMutation.error} />
          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={closeQuickAction} disabled={quickMutation.isPending}>Voltar</button>
            <button type="submit" className="danger-button" disabled={!observation.trim() || quickMutation.isPending}>{quickMutation.isPending ? 'Registrando...' : cancellationKind === 'absence' ? 'Registrar falta' : 'Confirmar cancelamento'}</button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

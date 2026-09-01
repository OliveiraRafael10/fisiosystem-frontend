import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutGrid, List, Plus, UsersRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDateTime, initials, localDate, statusConsultaLabel } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import { referralService } from '../../services/referralService'
import { therapistService } from '../../services/therapistService'
import type { Consulta, ConsultaInput } from '../../types'

const emptyAppointment: ConsultaInput = { dataHora: `${localDate()}T08:00`, encaminhamento: { id: 0 }, fisioterapeuta: { id: 0 }, observacoes: '' }

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
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(localDate())
  const [view, setView] = useState<'agenda' | 'lista'>('agenda')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ConsultaInput>(emptyAppointment)
  const [selected, setSelected] = useState<Consulta | null>(null)
  const [action, setAction] = useState<'complete' | 'reschedule' | 'cancel' | 'absence'>('complete')
  const [clinical, setClinical] = useState({ diagnostico: '', procedimentos: '', conduta: '' })
  const [observation, setObservation] = useState('')
  const [newDateTime, setNewDateTime] = useState('')
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: appointmentService.list })
  const agenda = useQuery({ queryKey: ['appointments', 'agenda', selectedDate], queryFn: () => appointmentService.agenda(selectedDate) })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['appointments'] })
    void queryClient.invalidateQueries({ queryKey: ['referrals'] })
  }
  const createMutation = useMutation({ mutationFn: () => appointmentService.create(form), onSuccess: () => { invalidate(); setSelectedDate(form.dataHora.slice(0, 10)); setFormOpen(false); setForm(emptyAppointment) } })
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error('Selecione uma consulta.')
      if (action === 'complete') return appointmentService.complete(selected.id, clinical)
      if (action === 'reschedule') return appointmentService.reschedule(selected.id, newDateTime)
      if (action === 'cancel') return appointmentService.cancel(selected.id, observation)
      return appointmentService.markAbsence(selected.id, observation)
    },
    onSuccess: () => { invalidate(); setSelected(null); setClinical({ diagnostico: '', procedimentos: '', conduta: '' }); setObservation(''); setNewDateTime('') },
  })
  const week = useMemo(() => weekAround(selectedDate), [selectedDate])
  const selectedAppointments = agenda.data ?? []
  const availableReferrals = (referrals.data ?? []).filter((item) => ['ASSUMIDO', 'EM_TRATAMENTO'].includes(item.statusEncaminhamento))
  const queries = [appointments, agenda, referrals, therapists]
  const errorQuery = queries.find((item) => item.isError)

  function saveAppointment(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  function moveWeek(amount: number) {
    const date = new Date(`${selectedDate}T12:00:00`)
    date.setDate(date.getDate() + amount * 7)
    setSelectedDate(localDate(date))
  }

  if (queries.some((item) => item.isLoading)) return <section className="page-content"><ApiLoading label="Sincronizando a agenda..." /></section>
  if (errorQuery) return <section className="page-content"><ApiError error={errorQuery.error} retry={() => queries.forEach((item) => void item.refetch())} /></section>

  return (
    <section className="page-content">
      <PageHeader eyebrow="AGENDA CLÍNICA" title="Consultas" description="Agendamento e registros clínicos conectados às regras do backend." actions={<button className="primary-button page-primary" onClick={() => { createMutation.reset(); setForm({ ...emptyAppointment, dataHora: `${selectedDate}T08:00` }); setFormOpen(true) }}><Plus size={18} /> Agendar consulta</button>} />
      <div className="calendar-toolbar"><div className="calendar-navigation"><button onClick={() => moveWeek(-1)}><ChevronLeft size={18} /></button><div><strong>{new Date(`${week[0].date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} — {new Date(`${week[4].date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</strong><span>{new Date(`${selectedDate}T12:00:00`).getFullYear()}</span></div><button onClick={() => moveWeek(1)}><ChevronRight size={18} /></button><button className="today-button" onClick={() => setSelectedDate(localDate())}>Hoje</button></div><div className="view-switch"><button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}><LayoutGrid size={16} /> Agenda</button><button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}><List size={16} /> Lista</button></div></div>
      <div className="week-selector">{week.map((day) => <button className={selectedDate === day.date ? 'selected' : ''} onClick={() => setSelectedDate(day.date)} key={day.date}><span>{day.week}</span><strong>{day.day}</strong><i>{appointments.data?.filter((item) => item.dataHora.startsWith(day.date)).length || '—'}</i></button>)}</div>
      <div className="agenda-layout">
        <section className="data-panel agenda-main"><div className="agenda-header"><div><h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h2><p>{selectedAppointments.length} atendimentos programados</p></div><span className="capacity-badge"><UsersRound size={15} /> {new Set(selectedAppointments.map((item) => item.fisioterapeutaId)).size} profissionais</span></div>
          {selectedAppointments.length ? <div className={`consultation-list ${view === 'lista' ? 'compact-list' : ''}`}>{selectedAppointments.map((item, index) => <article className="consultation-card" key={item.id}><div className="consultation-time"><strong>{item.dataHora.slice(11, 16)}</strong><span>Consulta #{item.id}</span></div><div className={`consultation-color color-${index % 4}`} /><div className="consultation-patient"><span className="patient-avatar large">{initials(item.pacienteNome)}</span><div><strong>{item.pacienteNome}</strong><span>Encaminhamento #{item.encaminhamentoId}</span></div></div><div className="consultation-therapist"><span>Profissional</span><strong>{item.fisioterapeutaNome}</strong></div><StatusBadge>{statusConsultaLabel[item.status]}</StatusBadge><button className="secondary-button small" onClick={() => { actionMutation.reset(); setSelected(item) }}>Abrir</button></article>)}</div> : <div className="empty-state agenda-empty"><CalendarDays size={28} /><strong>Agenda livre neste dia</strong><p>Selecione outro dia ou agende um atendimento.</p><button className="primary-button" onClick={() => setFormOpen(true)}>Agendar consulta</button></div>}
        </section>
        <aside className="agenda-side"><section className="panel day-overview"><div className="panel-heading"><div><h2>Resumo do dia</h2><p>Status dos atendimentos</p></div></div><div className="radial-progress"><div style={{ '--progress': `${Math.min(100, selectedAppointments.length * 8)}%` } as React.CSSProperties}><strong>{selectedAppointments.length}</strong><span>consultas</span></div></div><div className="overview-line"><span><i className="legend confirmed" /> Agendadas</span><strong>{selectedAppointments.filter((item) => item.status === 'AGENDADA').length}</strong></div><div className="overview-line"><span><i className="legend pending" /> Realizadas</span><strong>{selectedAppointments.filter((item) => item.status === 'REALIZADA').length}</strong></div><div className="overview-line"><span><i className="legend free" /> Faltas/canceladas</span><strong>{selectedAppointments.filter((item) => ['FALTA', 'CANCELADA'].includes(item.status)).length}</strong></div></section><section className="panel next-slot"><span><Clock3 size={19} /></span><div><small>INTEGRAÇÃO ATIVA</small><strong>Agenda do Spring</strong><p>Dados atualizados automaticamente</p></div></section></aside>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Agendar consulta" description="Somente encaminhamentos assumidos ou em tratamento podem ser agendados." size="large"><form onSubmit={saveAppointment}><div className="form-section"><div className="form-section-title"><span><CalendarDays size={18} /></span><div><strong>Detalhes do atendimento</strong><small>O backend validará profissional, data e horário</small></div></div><div className="form-grid">
        <label className="field field-wide"><span>Encaminhamento</span><select value={form.encaminhamento.id} onChange={(event) => setForm({ ...form, encaminhamento: { id: Number(event.target.value) } })} required><option value={0}>Selecione</option>{availableReferrals.map((item) => <option value={item.id} key={item.id}>#{item.id} • {item.pacienteNome} • {item.patologia}</option>)}</select></label>
        <label className="field"><span>Fisioterapeuta</span><select value={form.fisioterapeuta.id} onChange={(event) => setForm({ ...form, fisioterapeuta: { id: Number(event.target.value) } })} required><option value={0}>Selecione</option>{therapists.data?.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome} • {item.crefito}</option>)}</select></label>
        <label className="field"><span>Data e horário</span><input type="datetime-local" value={form.dataHora} onChange={(event) => setForm({ ...form, dataHora: event.target.value })} required /></label>
        <label className="field field-wide"><span>Observações</span><textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} /></label>
      </div></div><MutationError error={createMutation.error} /><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" disabled={createMutation.isPending || !form.encaminhamento.id || !form.fisioterapeuta.id}>{createMutation.isPending ? 'Agendando...' : 'Confirmar agendamento'}</button></div></form></Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Consulta #${selected.id}` : ''} description={selected ? `${selected.pacienteNome} • ${formatDateTime(selected.dataHora)}` : ''} size="large">{selected && <div className="patient-profile"><div className="profile-hero"><span className="profile-avatar">{initials(selected.pacienteNome)}</span><div><StatusBadge>{statusConsultaLabel[selected.status]}</StatusBadge><h3>{selected.pacienteNome}</h3><p>{selected.fisioterapeutaNome}</p></div></div>{selected.status === 'AGENDADA' && <><div className="filter-tabs">{([['complete', 'Realizar'], ['reschedule', 'Reagendar'], ['cancel', 'Cancelar'], ['absence', 'Registrar falta']] as const).map(([value, label]) => <button className={action === value ? 'selected' : ''} onClick={() => { setAction(value); actionMutation.reset() }} key={value}>{label}</button>)}</div>{action === 'complete' && <div className="form-section"><div className="form-grid"><label className="field field-wide"><span>Diagnóstico</span><textarea value={clinical.diagnostico} onChange={(event) => setClinical({ ...clinical, diagnostico: event.target.value })} /></label><label className="field field-wide"><span>Procedimentos</span><textarea value={clinical.procedimentos} onChange={(event) => setClinical({ ...clinical, procedimentos: event.target.value })} /></label><label className="field field-wide"><span>Conduta</span><textarea value={clinical.conduta} onChange={(event) => setClinical({ ...clinical, conduta: event.target.value })} /></label></div></div>}{action === 'reschedule' && <div className="form-section"><label className="field"><span>Nova data e horário</span><input type="datetime-local" value={newDateTime} onChange={(event) => setNewDateTime(event.target.value)} /></label></div>}{['cancel', 'absence'].includes(action) && <div className="form-section"><label className="field field-wide"><span>Observação</span><textarea value={observation} onChange={(event) => setObservation(event.target.value)} /></label></div>}<MutationError error={actionMutation.error} /><div className="modal-footer"><button className="primary-button" disabled={actionMutation.isPending || (action === 'complete' && Object.values(clinical).some((value) => !value.trim())) || (action === 'reschedule' && !newDateTime)} onClick={() => actionMutation.mutate()}>{actionMutation.isPending ? 'Salvando...' : 'Confirmar ação'}</button></div></>}{selected.status !== 'AGENDADA' && <div className="form-section"><h3>Registro clínico</h3><p><strong>Diagnóstico:</strong> {selected.diagnostico || 'Não informado'}</p><p><strong>Procedimentos:</strong> {selected.procedimentos || 'Não informado'}</p><p><strong>Conduta:</strong> {selected.conduta || 'Não informada'}</p><p><strong>Observações:</strong> {selected.observacoes || 'Sem observações'}</p></div>}</div>}</Modal>
    </section>
  )
}

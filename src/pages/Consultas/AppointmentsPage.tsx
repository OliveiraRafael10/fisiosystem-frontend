import { useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LayoutGrid, List, Plus, UsersRound } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { appointments as initialAppointments, patients, therapists } from '../../data/mockData'
import type { Appointment } from '../../types'

const days = [
  { week: 'SEG', day: '31', date: '2026-08-31' },
  { week: 'TER', day: '01', date: '2026-09-01' },
  { week: 'QUA', day: '02', date: '2026-09-02' },
  { week: 'QUI', day: '03', date: '2026-09-03' },
  { week: 'SEX', day: '04', date: '2026-09-04' },
]

const emptyAppointment = { patient: '', therapist: '', specialty: '', date: '2026-09-01', time: '', duration: 50 }

export function AppointmentsPage() {
  const [items, setItems] = useState(initialAppointments)
  const [selectedDate, setSelectedDate] = useState('2026-09-01')
  const [view, setView] = useState<'agenda' | 'lista'>('agenda')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyAppointment)
  const selectedAppointments = useMemo(() => items.filter((item) => item.date === selectedDate), [items, selectedDate])

  function saveAppointment(event: FormEvent) {
    event.preventDefault()
    const appointment: Appointment = { ...form, id: Math.max(...items.map((item) => item.id)) + 1, status: 'Pendente' }
    setItems((current) => [...current, appointment])
    setSelectedDate(form.date)
    setForm(emptyAppointment)
    setFormOpen(false)
  }

  return (
    <section className="page-content">
      <PageHeader eyebrow="AGENDA CLÍNICA" title="Consultas" description="Organize os atendimentos, confirme presenças e acompanhe a rotina da equipe." actions={<button className="primary-button page-primary" onClick={() => setFormOpen(true)}><Plus size={18} /> Agendar consulta</button>} />
      <div className="calendar-toolbar"><div className="calendar-navigation"><button><ChevronLeft size={18} /></button><div><strong>31 ago — 04 set</strong><span>Semana 36 • 2026</span></div><button><ChevronRight size={18} /></button><button className="today-button">Hoje</button></div><div className="view-switch"><button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')}><LayoutGrid size={16} /> Agenda</button><button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')}><List size={16} /> Lista</button></div></div>
      <div className="week-selector">{days.map((day) => <button className={selectedDate === day.date ? 'selected' : ''} onClick={() => setSelectedDate(day.date)} key={day.date}><span>{day.week}</span><strong>{day.day}</strong><i>{items.filter((item) => item.date === day.date).length || '—'}</i></button>)}</div>
      <div className="agenda-layout">
        <section className="data-panel agenda-main"><div className="agenda-header"><div><h2>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h2><p>{selectedAppointments.length} atendimentos programados</p></div><span className="capacity-badge"><UsersRound size={15} /> 3 salas em uso</span></div>
          {selectedAppointments.length ? <div className={`consultation-list ${view === 'lista' ? 'compact-list' : ''}`}>{selectedAppointments.map((item, index) => <article className="consultation-card" key={item.id}><div className="consultation-time"><strong>{item.time}</strong><span>{item.duration} min</span></div><div className={`consultation-color color-${index % 4}`} /><div className="consultation-patient"><span className="patient-avatar large">{item.patient.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{item.patient}</strong><span>{item.specialty}</span></div></div><div className="consultation-therapist"><span>Profissional</span><strong>{item.therapist}</strong></div><StatusBadge>{item.status}</StatusBadge><button className="secondary-button small">Abrir</button></article>)}</div> : <div className="empty-state agenda-empty"><CalendarDays size={28} /><strong>Agenda livre neste dia</strong><p>Selecione outro dia ou agende um novo atendimento.</p><button className="primary-button" onClick={() => setFormOpen(true)}>Agendar consulta</button></div>}
        </section>
        <aside className="agenda-side"><section className="panel day-overview"><div className="panel-heading"><div><h2>Resumo do dia</h2><p>Capacidade e confirmações</p></div></div><div className="radial-progress"><div style={{ '--progress': '72%' } as React.CSSProperties}><strong>72%</strong><span>ocupação</span></div></div><div className="overview-line"><span><i className="legend confirmed" /> Confirmadas</span><strong>13</strong></div><div className="overview-line"><span><i className="legend pending" /> Pendentes</span><strong>5</strong></div><div className="overview-line"><span><i className="legend free" /> Horários livres</span><strong>7</strong></div></section><section className="panel next-slot"><span><Clock3 size={19} /></span><div><small>PRÓXIMO HORÁRIO LIVRE</small><strong>Hoje às 15:10</strong><p>Sala 02 • 50 minutos</p></div><button onClick={() => setFormOpen(true)}>Agendar</button></section></aside>
      </div>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Agendar consulta" description="Escolha o paciente, profissional e horário do atendimento." size="large"><form onSubmit={saveAppointment}><div className="form-section"><div className="form-section-title"><span><CalendarDays size={18} /></span><div><strong>Detalhes do atendimento</strong><small>Agenda clínica</small></div></div><div className="form-grid"><label className="field field-wide"><span>Paciente</span><select value={form.patient} onChange={(event) => setForm({ ...form, patient: event.target.value })} required><option value="">Selecione</option>{patients.map((patient) => <option key={patient.id}>{patient.name}</option>)}</select></label><label className="field"><span>Fisioterapeuta</span><select value={form.therapist} onChange={(event) => setForm({ ...form, therapist: event.target.value })} required><option value="">Selecione</option>{therapists.map((therapist) => <option key={therapist.id}>{therapist.name}</option>)}</select></label><label className="field"><span>Especialidade</span><select value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required><option value="">Selecionar</option><option>Ortopedia</option><option>Neurologia</option><option>Geriatria</option><option>Respiratória</option></select></label><label className="field"><span>Data</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label className="field"><span>Horário</span><input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} required /></label><label className="field"><span>Duração</span><select value={form.duration} onChange={(event) => setForm({ ...form, duration: Number(event.target.value) })}><option value={30}>30 minutos</option><option value={50}>50 minutos</option><option value={60}>60 minutos</option></select></label></div></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Confirmar agendamento</button></div></form></Modal>
    </section>
  )
}

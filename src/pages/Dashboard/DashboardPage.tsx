import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronRight, ClipboardPlus, Stethoscope, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/ApiState'
import { PageHeader } from '../../components/ui/PageHeader'
import { getPrioridadeLabel, getStatusConsultaLabel, initials, localDate } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'
import { therapistService } from '../../services/therapistService'

export function DashboardPage() {
  const navigate = useNavigate()
  const today = localDate()
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const appointments = useQuery({ queryKey: ['appointments', 'agenda', today], queryFn: () => appointmentService.agenda(today) })
  const referralIndicators = useQuery({ queryKey: ['referrals', 'indicators'], queryFn: referralService.indicators })
  const priorityIndicators = useQuery({ queryKey: ['referrals', 'queue-priority'], queryFn: referralService.queuePriorityIndicators })
  const queue = useQuery({ queryKey: ['referrals', 'queue'], queryFn: referralService.queue })
  const queries = [patients, therapists, appointments, referralIndicators, priorityIndicators, queue]
  const errorQuery = queries.find((query) => query.isError)

  if (queries.some((query) => query.isLoading)) return <section className="page-content"><ApiLoading label="Montando sua visão geral..." /></section>
  if (errorQuery) return <section className="page-content"><ApiError error={errorQuery.error} retry={() => queries.forEach((query) => void query.refetch())} /></section>

  const activeTherapists = therapists.data?.filter((item) => item.ativo) ?? []
  const todayAppointments = appointments.data ?? []
  const priorityQueue = (queue.data ?? []).slice(0, 3)
  const headerDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()

  return (
    <section className="page-content">
      <PageHeader eyebrow={headerDate} title="Bom dia, Rafa." description="Dados sincronizados com a operação do FisioSystem." actions={<button className="date-button"><CalendarDays size={18} /> Hoje <ChevronRight size={16} /></button>} />
      <div className="stats-grid bento-stats">
        <article className="stat-card accent-teal"><div className="stat-top"><span className="stat-icon"><UsersRound /></span><span className="positive">Base atual</span></div><strong>{patients.data?.length ?? 0}</strong><p>Pacientes cadastrados</p><div className="mini-bars"><i /><i /><i /><i /><i /><i /></div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><CalendarDays /></span><span className="neutral">Hoje</span></div><strong>{todayAppointments.length}</strong><p>Consultas na agenda</p><div className="progress-line"><span style={{ width: `${Math.min(100, todayAppointments.length * 8)}%` }} /></div><small>{todayAppointments.filter((item) => item.status === 'AGENDADA').length} ainda agendadas</small></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon orange"><ClipboardPlus /></span><span className="warning">Atenção</span></div><strong>{referralIndicators.data?.naFila ?? 0}</strong><p>Na fila de espera</p><div className="progress-line orange-line"><span style={{ width: `${Math.min(100, (priorityIndicators.data?.primaria ?? 0) * 15)}%` }} /></div><small>{priorityIndicators.data?.primaria ?? 0} com prioridade alta</small></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><Stethoscope /></span><span className="positive">Ativos</span></div><strong>{activeTherapists.length}</strong><p>Fisioterapeutas</p><div className="team-avatars">{activeTherapists.slice(0, 3).map((item) => <span key={item.id}>{initials(item.nome)}</span>)}{activeTherapists.length > 3 && <span>+{activeTherapists.length - 3}</span>}</div></article>
      </div>
      <div className="dashboard-grid bento-dashboard">
        <section className="panel schedule-panel">
          <div className="panel-heading"><div><h2>Agenda de hoje</h2><p>{todayAppointments.length} atendimentos programados</p></div><button onClick={() => navigate('/consultas')}>Ver agenda completa <ChevronRight size={16} /></button></div>
          <div className="schedule-list">
            {todayAppointments.slice(0, 4).map((item, index) => <article className="appointment" key={item.id}><div className="time"><strong>{item.dataHora?.slice(11, 16) || '—'}</strong><span>{getStatusConsultaLabel(item.status).toLocaleLowerCase('pt-BR')}</span></div><span className={`timeline-dot dot-${index}`} /><div className="patient-avatar">{initials(item.pacienteNome)}</div><div className="appointment-info"><strong>{item.pacienteNome || 'Paciente não informado'}</strong><span>Encaminhamento #{item.encaminhamentoId}</span></div><span className="therapist">{item.fisioterapeutaNome?.split(' ')[0] || '—'}</span><button className="more-button" onClick={() => navigate('/consultas')}>•••</button></article>)}
            {!todayAppointments.length && <div className="empty-state"><CalendarDays size={24} /><strong>Nenhuma consulta hoje</strong><p>A agenda está livre para novos atendimentos.</p></div>}
          </div>
        </section>
        <aside className="panel priority-panel">
          <div className="panel-heading"><div><h2>Fila prioritária</h2><p>Ordenada pelo backend</p></div><button className="round-arrow" onClick={() => navigate('/encaminhamentos')}><ChevronRight size={17} /></button></div>
          {priorityQueue.map((item, index) => index === 0 ? <div className="priority-highlight" key={item.id}><span className="priority-number">01</span><div><span className="danger-label">{getPrioridadeLabel(item.prioridade).toUpperCase()} PRIORIDADE</span><strong>{item.pacienteNome || 'Paciente não informado'}</strong><p>{item.patologia || 'Patologia não informada'} • {item.tipoAtendimento || '—'}</p></div></div> : <div className="priority-row" key={item.id}><span>0{index + 1}</span><div><strong>{item.pacienteNome || 'Paciente não informado'}</strong><p>{item.patologia || 'Patologia não informada'}</p></div><em>{getPrioridadeLabel(item.prioridade)}</em></div>)}
          {!priorityQueue.length && <div className="empty-state"><ClipboardPlus size={22} /><strong>Fila vazia</strong><p>Não há encaminhamentos aguardando vaga.</p></div>}
          <button className="queue-button" onClick={() => navigate('/encaminhamentos')}>Organizar fila de espera</button>
        </aside>
      </div>
    </section>
  )
}

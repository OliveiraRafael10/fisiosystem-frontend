import { CalendarDays, ChevronRight, ClipboardPlus, Stethoscope, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { appointments, referrals } from '../../data/mockData'
import { PageHeader } from '../../components/ui/PageHeader'

export function DashboardPage() {
  const navigate = useNavigate()
  const todayAppointments = appointments.filter((item) => item.date === '2026-09-01').slice(0, 4)
  const priorityQueue = referrals.filter((item) => item.status === 'Aguardando vaga').slice(0, 3)

  return (
    <section className="page-content">
      <PageHeader
        eyebrow="TERÇA-FEIRA, 1 DE SETEMBRO"
        title="Bom dia, Rafa."
        description="Acompanhe o movimento da unidade e organize os próximos atendimentos."
        actions={<button className="date-button"><CalendarDays size={18} /> Hoje <ChevronRight size={16} /></button>}
      />
      <div className="stats-grid">
        <article className="stat-card accent-teal"><div className="stat-top"><span className="stat-icon"><UsersRound /></span><span className="positive">+8 este mês</span></div><strong>248</strong><p>Pacientes ativos</p><div className="mini-bars"><i /><i /><i /><i /><i /><i /></div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon blue"><CalendarDays /></span><span className="neutral">Hoje</span></div><strong>18</strong><p>Consultas agendadas</p><div className="progress-line"><span style={{ width: '72%' }} /></div><small>13 de 18 confirmadas</small></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon orange"><ClipboardPlus /></span><span className="warning">Atenção</span></div><strong>12</strong><p>Na fila de espera</p><div className="progress-line orange-line"><span style={{ width: '44%' }} /></div><small>3 com prioridade alta</small></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-icon violet"><Stethoscope /></span><span className="positive">Completa</span></div><strong>7</strong><p>Fisioterapeutas</p><div className="team-avatars"><span>MA</span><span>RF</span><span>HC</span><span>+4</span></div></article>
      </div>
      <div className="dashboard-grid">
        <section className="panel schedule-panel">
          <div className="panel-heading"><div><h2>Agenda de hoje</h2><p>18 atendimentos • 3 profissionais</p></div><button onClick={() => navigate('/consultas')}>Ver agenda completa <ChevronRight size={16} /></button></div>
          <div className="schedule-list">
            {todayAppointments.map((item, index) => (
              <article className="appointment" key={item.id}>
                <div className="time"><strong>{item.time}</strong><span>{index === 0 ? 'em 12 min' : `${item.duration} min`}</span></div>
                <span className={`timeline-dot dot-${index}`} />
                <div className="patient-avatar">{item.patient.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div className="appointment-info"><strong>{item.patient}</strong><span>{item.specialty}</span></div>
                <span className="therapist">{item.therapist.split(' ')[0]}</span>
                <button className="more-button" aria-label={`Detalhes de ${item.patient}`} onClick={() => navigate('/consultas')}>•••</button>
              </article>
            ))}
          </div>
        </section>
        <aside className="panel priority-panel">
          <div className="panel-heading"><div><h2>Fila prioritária</h2><p>Pacientes aguardando vaga</p></div><button className="round-arrow" onClick={() => navigate('/encaminhamentos')}><ChevronRight size={17} /></button></div>
          {priorityQueue.map((item, index) => index === 0 ? (
            <div className="priority-highlight" key={item.id}><span className="priority-number">01</span><div><span className="danger-label">ALTA PRIORIDADE</span><strong>{item.patient}</strong><p>{item.specialty} • {item.diagnosis}</p></div><span className="wait-time">{item.waitDays} dias</span></div>
          ) : (
            <div className="priority-row" key={item.id}><span>0{index + 1}</span><div><strong>{item.patient}</strong><p>{item.specialty} • {item.diagnosis}</p></div><em>{item.waitDays} dias</em></div>
          ))}
          <button className="queue-button" onClick={() => navigate('/encaminhamentos')}>Organizar fila de espera</button>
        </aside>
      </div>
      <div className="insight-strip">
        <span className="insight-icon"><ActivityMark /></span>
        <div><strong>Ritmo da unidade</strong><p>A taxa de comparecimento subiu 6% em agosto. O melhor horário de adesão tem sido entre 8h e 11h.</p></div>
        <button onClick={() => navigate('/relatorios')}>Ver análise <ChevronRight size={15} /></button>
      </div>
    </section>
  )
}

function ActivityMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2.2-6 4.1 12 2.2-6H21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

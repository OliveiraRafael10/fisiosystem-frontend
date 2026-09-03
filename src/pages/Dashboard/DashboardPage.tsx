import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, AlertTriangle, BellRing, CalendarDays, ChevronRight, ClipboardPlus, Stethoscope, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { daysWaiting, formatDate, getPrioridadeLabel, initials, localDate, priorityTone } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'
import { therapistService } from '../../services/therapistService'
import type { Encaminhamento, Prioridade } from '../../types'

type QueueFilter = 'TODOS' | Prioridade

const priorityCode: Record<Prioridade, string> = {
  PRIMARIA: 'P1',
  SECUNDARIA: 'P2',
  TERCIARIA: 'P3',
}

const alertWaitLimit: Record<Prioridade, number> = {
  PRIMARIA: 14,
  SECUNDARIA: 27,
  TERCIARIA: 30,
}

export function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('TODOS')
  const [selectedReferral, setSelectedReferral] = useState<Encaminhamento | null>(null)
  const [therapistId, setTherapistId] = useState(0)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const today = localDate()
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const appointments = useQuery({ queryKey: ['appointments', 'agenda', today], queryFn: () => appointmentService.agenda(today) })
  const referralIndicators = useQuery({ queryKey: ['referrals', 'indicators'], queryFn: referralService.indicators })
  const priorityIndicators = useQuery({ queryKey: ['referrals', 'queue-priority'], queryFn: referralService.queuePriorityIndicators })
  const queue = useQuery({ queryKey: ['referrals', 'queue'], queryFn: referralService.queue })
  const assumeMutation = useMutation({
    mutationFn: () => {
      if (!selectedReferral || !therapistId) throw new Error('Selecione um fisioterapeuta para assumir o caso.')
      return referralService.assume(selectedReferral.id, therapistId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setSelectedReferral(null)
      setTherapistId(0)
    },
  })
  const queries = [patients, therapists, appointments, referralIndicators, priorityIndicators, queue]
  const errorQuery = queries.find((query) => query.isError)

  if (queries.some((query) => query.isLoading)) return <section className="page-content"><ApiLoading label="Montando sua visão geral..." /></section>
  if (errorQuery) return <section className="page-content"><ApiError error={errorQuery.error} retry={() => queries.forEach((query) => void query.refetch())} /></section>

  const activeTherapists = therapists.data?.filter((item) => item.ativo) ?? []
  const todayAppointments = appointments.data ?? []
  const fullQueue = queue.data ?? []
  const filteredQueue = fullQueue.filter((item) => queueFilter === 'TODOS' || item.prioridade === queueFilter).slice(0, 5)
  const primaryCount = priorityIndicators.data?.primaria ?? 0
  const referralAlerts = fullQueue.filter((item) => daysWaiting(item.dataEntrega) > alertWaitLimit[item.prioridade])
  const alertCount = referralAlerts.length
  const headerDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()

  function openReferral(referral: Encaminhamento) {
    assumeMutation.reset()
    setAlertsOpen(false)
    setTherapistId(0)
    setSelectedReferral(referral)
  }

  function closeReferral() {
    assumeMutation.reset()
    setTherapistId(0)
    setSelectedReferral(null)
  }

  return (
    <section className="page-content dashboard-page">
      <PageHeader
        eyebrow={headerDate}
        title="Bom dia, Rafa."
        description="Prioridades da unidade e próximos atendimentos em uma visão operacional."
        actions={(
          <button className={`dashboard-alert-button ${referralAlerts.length ? 'has-critical' : ''}`} onClick={() => setAlertsOpen(true)}>
            <span className="dashboard-alert-icon"><BellRing size={20} />{alertCount > 0 && <b>{alertCount > 99 ? '99+' : alertCount}</b>}</span>
            <span className="dashboard-alert-label"><strong>Alertas</strong><small>{alertCount ? `${alertCount} ${alertCount === 1 ? 'caso pendente' : 'casos pendentes'}` : 'Tudo em ordem'}</small></span>
            <ChevronRight size={17} />
          </button>
        )}
      />

      <div className="stats-grid dashboard-stat-grid">
        <button className="stat-card accent-teal dashboard-stat-button" onClick={() => navigate('/pacientes')}><div className="stat-top"><span className="stat-icon"><UsersRound /></span><span className="positive">Base atual</span></div><strong>{patients.data?.length ?? 0}</strong><p>Pacientes cadastrados</p><small>Acessar prontuários</small></button>
        <button className="stat-card dashboard-stat-button" onClick={() => navigate('/consultas')}><div className="stat-top"><span className="stat-icon blue"><CalendarDays /></span><span className="neutral">Hoje</span></div><strong>{todayAppointments.length}</strong><p>Consultas hoje</p><small>{todayAppointments.filter((item) => item.status === 'AGENDADA').length} ainda agendadas</small></button>
        <button className="stat-card dashboard-stat-button queue-stat-card" onClick={() => navigate('/encaminhamentos?status=NA_FILA')}><div className="stat-top"><span className="stat-icon orange"><ClipboardPlus /></span><span className="warning">{primaryCount ? 'Requer atenção' : 'Fila atual'}</span></div><strong>{referralIndicators.data?.naFila ?? 0}</strong><p>Na fila de espera</p><small>{primaryCount} com prioridade primária</small></button>
        <button className="stat-card dashboard-stat-button" onClick={() => navigate('/encaminhamentos?status=EM_TRATAMENTO')}><div className="stat-top"><span className="stat-icon mint"><Activity /></span><span className="positive">Em curso</span></div><strong>{referralIndicators.data?.emTratamento ?? 0}</strong><p>Em tratamento</p><small>{referralIndicators.data?.assumidos ?? 0} casos assumidos</small></button>
        <button className="stat-card dashboard-stat-button" onClick={() => navigate('/fisioterapeutas?status=ativos')}><div className="stat-top"><span className="stat-icon violet"><Stethoscope /></span><span className="positive">Ativos</span></div><strong>{activeTherapists.length}</strong><p>Fisioterapeutas ativos</p><div className="team-avatars">{activeTherapists.slice(0, 3).map((item) => <span key={item.id}>{initials(item.nome)}</span>)}{activeTherapists.length > 3 && <span>+{activeTherapists.length - 3}</span>}</div></button>
      </div>

      <div className="operational-dashboard">
        <section className="panel dashboard-queue-panel">
          <header className="queue-panel-heading">
            <div className="queue-heading-top">
              <div><h2>Fila de encaminhamentos</h2><p>Ordenada por prioridade e tempo de espera</p></div>
              <strong>{referralIndicators.data?.naFila ?? 0} aguardando <i /> {primaryCount} prioritários</strong>
            </div>
            <div className="queue-filter-tabs" aria-label="Filtrar fila por prioridade">
              {([['TODOS', 'Todos'], ['PRIMARIA', 'Primária'], ['SECUNDARIA', 'Secundária'], ['TERCIARIA', 'Terciária']] as const).map(([value, label]) => <button className={queueFilter === value ? 'selected' : ''} onClick={() => setQueueFilter(value)} key={value}>{label}</button>)}
            </div>
          </header>

          <div className="dashboard-queue-list">
            {filteredQueue.map((item) => {
              const waiting = daysWaiting(item.dataEntrega)
              return (
                <button
                  className={`dashboard-queue-item ${item.prioridade === 'PRIMARIA' ? 'is-primary' : ''}`}
                  key={item.id}
                  onClick={() => openReferral(item)}
                  aria-label={`Abrir encaminhamento de ${item.pacienteNome || 'paciente não informado'} para assumir o caso`}
                >
                  <span className="queue-position">{String(fullQueue.indexOf(item) + 1).padStart(2, '0')}</span>
                  <div className="queue-person"><strong>{item.pacienteNome || 'Paciente não informado'}</strong><p>{item.patologia || 'Patologia não informada'} <i /> {item.tipoAtendimento || 'Tipo não informado'}</p></div>
                  <span className={`queue-priority priority-${priorityTone(item.prioridade)}`}><b>{priorityCode[item.prioridade] ?? '—'}</b>{getPrioridadeLabel(item.prioridade)}</span>
                  <div className="queue-date"><span>Entrada</span><strong>{formatDate(item.dataEntrega)}</strong></div>
                  <div className={`queue-wait ${waiting >= 14 ? 'is-overdue' : ''}`}><strong>{waiting} dias</strong><span>aguardando</span></div>
                </button>
              )
            })}
            {!filteredQueue.length && <div className="empty-state"><ClipboardPlus size={25} /><strong>Nenhum encaminhamento nesta prioridade</strong><p>Use outro filtro para consultar a fila atual.</p></div>}
          </div>

          <footer className="queue-panel-footer"><span>Exibindo {filteredQueue.length} de {fullQueue.length} encaminhamentos</span><button onClick={() => navigate('/encaminhamentos?status=NA_FILA')}>Ver fila completa <ChevronRight size={17} /></button></footer>
        </section>

        <aside className="panel dashboard-agenda-panel">
          <div className="panel-heading"><div><h2>Agenda de hoje</h2><p>{todayAppointments.length === 1 ? '1 atendimento programado' : `${todayAppointments.length} atendimentos programados`}</p></div></div>
          <div className="compact-agenda-list">
            {todayAppointments.slice(0, 5).map((item) => (
              <article className="compact-agenda-item" key={item.id}>
                <time>{item.dataHora?.slice(11, 16) || '—'}</time>
                <span className="compact-agenda-avatar" aria-hidden="true">{initials(item.pacienteNome)}</span>
                <div className="compact-agenda-info">
                  <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                  <span>Fisioterapeuta: {item.fisioterapeutaNome || 'Não informado'}</span>
                </div>
              </article>
            ))}
            {!todayAppointments.length && <div className="empty-state compact-empty"><CalendarDays size={24} /><strong>Nenhuma consulta hoje</strong><p>A agenda está livre para novos atendimentos.</p></div>}
          </div>
          <button className="agenda-full-button" onClick={() => navigate('/consultas')}>Ver agenda completa <ChevronRight size={17} /></button>
        </aside>
      </div>

      <Modal
        open={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        title="Alertas da fila"
        description="Encaminhamentos que ultrapassaram o prazo da respectiva prioridade"
        size="large"
      >
        <div className="dashboard-alert-center">
          <div className="dashboard-alert-summary">
            <span className={referralAlerts.length ? 'is-critical' : ''}><AlertTriangle size={22} /></span>
            <div><strong>{referralAlerts.length ? `${referralAlerts.length} ${referralAlerts.length === 1 ? 'caso requer' : 'casos requerem'} atenção` : 'Nenhuma prioridade crítica'}</strong><p>{referralAlerts.length ? 'Revise os casos prioritários ou com espera elevada.' : 'A fila não possui casos críticos neste momento.'}</p></div>
          </div>

          {referralAlerts.length > 0 && (
            <section className="dashboard-alert-group">
              <header><div><AlertTriangle size={18} /><strong>Fila de encaminhamentos</strong></div><span>{referralAlerts.length}</span></header>
              <div className="dashboard-alert-list">
                {referralAlerts.map((item) => {
                  const waiting = daysWaiting(item.dataEntrega)
                  return (
                    <button className={`dashboard-alert-item ${item.prioridade === 'PRIMARIA' ? 'critical' : 'warning'}`} onClick={() => openReferral(item)} key={`referral-${item.id}`}>
                      <span><AlertTriangle size={19} /></span>
                      <div><strong>{item.pacienteNome || 'Paciente não informado'}</strong><p>Prioridade {getPrioridadeLabel(item.prioridade).toLocaleLowerCase('pt-BR')} • {waiting} dias aguardando</p></div>
                      <ChevronRight size={18} />
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {!alertCount && <div className="empty-state dashboard-alert-empty"><BellRing size={28} /><strong>Nenhum alerta na fila</strong><p>A equipe está com os prazos de espera em dia.</p></div>}
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedReferral)}
        onClose={closeReferral}
        title={selectedReferral ? `Encaminhamento #${selectedReferral.id}` : ''}
        description={selectedReferral ? `${selectedReferral.pacienteNome || 'Paciente não informado'} • recebido em ${formatDate(selectedReferral.dataEntrega)}` : ''}
        size="large"
      >
        {selectedReferral && (
          <div className="patient-profile">
            <div className="profile-hero">
              <span className="profile-avatar">{initials(selectedReferral.pacienteNome)}</span>
              <div>
                <span className={`priority-pill priority-${priorityTone(selectedReferral.prioridade)}`}>{getPrioridadeLabel(selectedReferral.prioridade)}</span>
                <h3>{selectedReferral.patologia || 'Patologia não informada'}</h3>
                <p>{selectedReferral.tipoAtendimento || 'Tipo não informado'} • {daysWaiting(selectedReferral.dataEntrega)} dias na fila</p>
              </div>
            </div>
            <div className="profile-info-grid">
              <div><span>Paciente</span><strong>{selectedReferral.pacienteNome || 'Não informado'}</strong></div>
              <div><span>Médico solicitante</span><strong>{selectedReferral.medicoSolicitante || 'Não informado'}</strong></div>
              <div><span>Data de entrada</span><strong>{formatDate(selectedReferral.dataEntrega)}</strong></div>
              <div><span>Observações</span><strong>{selectedReferral.observacoes || 'Nenhuma observação'}</strong></div>
            </div>
            <div className="form-section dashboard-assume-section">
              <label className="field field-wide">
                <span>Fisioterapeuta que assumirá o caso</span>
                <select value={therapistId} onChange={(event) => setTherapistId(Number(event.target.value))}>
                  <option value={0}>Selecione um fisioterapeuta</option>
                  {activeTherapists.map((item) => <option value={item.id} key={item.id}>{item.nome} • {item.crefito || 'CREFITO não informado'}</option>)}
                </select>
              </label>
            </div>
            <MutationError error={assumeMutation.error} />
            <div className="modal-footer">
              <button type="button" className="secondary-button" onClick={closeReferral}>Agora não</button>
              <button className="primary-button" disabled={!therapistId || assumeMutation.isPending} onClick={() => assumeMutation.mutate()}>{assumeMutation.isPending ? 'Assumindo...' : 'Assumir encaminhamento'}</button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}

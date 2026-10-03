import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BellRing,
  CalendarDays,
  Plus,
  ChevronRight,
  ClipboardPlus,
  Stethoscope,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import {
  diasDeEspera,
  formatarData,
  obterRotuloPrioridade,
  iniciais,
  dataLocal,
  tomPrioridade,
} from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoPaciente } from '../../services/servicoPaciente'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import { servicoFisioterapeuta } from '../../services/servicoFisioterapeuta'
import type { Prioridade } from '../../types/modelos'

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

function getReferralActionLabel(patientName?: string | null) {
  return `Abrir encaminhamento de ${patientName || 'paciente não informado'} para assumir o caso`
}

export function PaginaPainel() {
  const navigate = useNavigate()
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('TODOS')
  const today = dataLocal()

  const patients = useQuery({
    queryKey: ['patients'],
    queryFn: servicoPaciente.listar,
  })
  const therapists = useQuery({
    queryKey: ['therapists'],
    queryFn: servicoFisioterapeuta.listar,
  })
  const appointments = useQuery({
    queryKey: ['appointments', 'agenda', today],
    queryFn: () => servicoConsulta.agenda(today),
  })
  const allAppointments = useQuery({
    queryKey: ['appointments'],
    queryFn: servicoConsulta.listar,
  })
  const referralIndicators = useQuery({
    queryKey: ['referrals', 'indicators'],
    queryFn: servicoEncaminhamento.obterIndicadores,
  })
  const priorityIndicators = useQuery({
    queryKey: ['referrals', 'queue-priority'],
    queryFn: servicoEncaminhamento.listarFilaPriorityIndicators,
  })
  const queue = useQuery({
    queryKey: ['referrals', 'queue'],
    queryFn: servicoEncaminhamento.listarFila,
  })

  const queries = [
    patients,
    therapists,
    appointments,
    allAppointments,
    referralIndicators,
    priorityIndicators,
    queue,
  ]
  const errorQuery = queries.find((query) => query.isError)

  if (queries.some((query) => query.isLoading)) {
    return (
      <section className="page-content">
        <ApiLoading label="Montando sua visão geral..." />
      </section>
    )
  }

  if (errorQuery) {
    return (
      <section className="page-content">
        <ApiError
          error={errorQuery.error}
          retry={() => queries.forEach((query) => void query.refetch())}
        />
      </section>
    )
  }

  const currentPath = `${location.pathname}${location.search}`
  const activeTherapists = therapists.data?.filter((item) => item.ativo) ?? []
  const todayAppointments = appointments.data ?? []
  const overdueAppointments = (allAppointments.data ?? []).filter(
    (item) => item.status === 'AGENDADA' && item.dataHora.slice(0, 10) < today,
  )
  const fullQueue = queue.data ?? []
  const filteredQueue = fullQueue
    .filter((item) => queueFilter === 'TODOS' || item.prioridade === queueFilter)
    .slice(0, 5)
  const primaryCount = priorityIndicators.data?.primaria ?? 0
  const referralAlerts = fullQueue.filter(
    (item) => diasDeEspera(item.dataEntrega) > alertWaitLimit[item.prioridade],
  )
  const alertCount = referralAlerts.length + overdueAppointments.length
  const headerDate = new Date()
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase()

  return (
    <section className="page-content dashboard-page">
      <CabecalhoPagina
        eyebrow={headerDate}
        title="Visão geral"
        description="Prioridades da unidade e próximos atendimentos em uma visão operacional."
        actions={
          <>
            <button
              className="primary-button page-primary"
              onClick={() => navigate('/encaminhamentos/novo', { state: { from: currentPath } })}
            >
              <Plus size={24} /> Novo encaminhamento
            </button>

            <button
              className={`dashboard-alert-button ${alertCount ? 'has-critical' : ''}`}
              onClick={() => navigate('/alertas', { state: { from: '/' } })}
            >
              <span className="dashboard-alert-icon">
                <BellRing size={20} />
                {alertCount > 0 && <b>{alertCount > 99 ? '99+' : alertCount}</b>}
              </span>
              <span className="dashboard-alert-label">
                <strong>Alertas</strong>
              </span>
              <ChevronRight size={17} />
            </button>
          </>
        }
      />

      <div className="stats-grid dashboard-stat-grid">
        <button
          className="stat-card accent-teal dashboard-stat-button"
          onClick={() => navigate('/pacientes')}
        >
          <div className="stat-top">
            <span className="stat-icon">
              <UsersRound />
            </span>
            <span className="positive">Base atual</span>
          </div>
          <strong>{patients.data?.length ?? 0}</strong>
          <p>Pacientes cadastrados</p>
          <small>Acessar prontuários</small>
        </button>

        <button className="stat-card dashboard-stat-button" onClick={() => navigate('/consultas')}>
          <div className="stat-top">
            <span className="stat-icon blue">
              <CalendarDays />
            </span>
            <span className="neutral">Hoje</span>
          </div>
          <strong>{todayAppointments.length}</strong>
          <p>Consultas hoje</p>
          <small>
            {todayAppointments.filter((item) => item.status === 'AGENDADA').length} ainda agendadas
          </small>
        </button>

        <button
          className="stat-card dashboard-stat-button queue-stat-card"
          onClick={() => navigate('/encaminhamentos?status=NA_FILA')}
        >
          <div className="stat-top">
            <span className="stat-icon orange">
              <ClipboardPlus />
            </span>
            <span className="warning">{primaryCount ? 'Requer atenção' : 'Fila atual'}</span>
          </div>
          <strong>{referralIndicators.data?.naFila ?? 0}</strong>
          <p>Na fila de espera</p>
          <small>{primaryCount} com prioridade primária</small>
        </button>

        <button
          className="stat-card dashboard-stat-button"
          onClick={() => navigate('/encaminhamentos?status=EM_TRATAMENTO')}
        >
          <div className="stat-top">
            <span className="stat-icon mint">
              <Activity />
            </span>
            <span className="positive">Em curso</span>
          </div>
          <strong>{referralIndicators.data?.emTratamento ?? 0}</strong>
          <p>Em tratamento</p>
          <small>{referralIndicators.data?.assumidos ?? 0} casos assumidos</small>
        </button>

        <button
          className="stat-card dashboard-stat-button"
          onClick={() => navigate('/fisioterapeutas?status=ativos')}
        >
          <div className="stat-top">
            <span className="stat-icon violet">
              <Stethoscope />
            </span>
            <span className="positive">Ativos</span>
          </div>
          <strong>{activeTherapists.length}</strong>
          <p>Fisioterapeutas ativos</p>
          <div className="team-avatars">
            {activeTherapists.slice(0, 3).map((item) => (
              <span key={item.id}>{iniciais(item.nome)}</span>
            ))}
            {activeTherapists.length > 3 && <span>+{activeTherapists.length - 3}</span>}
          </div>
        </button>
      </div>

      <div className="operational-dashboard">
        <section className="panel dashboard-queue-panel">
          <header className="queue-panel-heading">
            <div className="queue-heading-top">
              <div>
                <h2>Fila de encaminhamentos</h2>
                <p>Ordenada por prioridade e tempo de espera</p>
              </div>
              <strong>
                {referralIndicators.data?.naFila ?? 0} aguardando <i /> {primaryCount} prioritários
              </strong>
            </div>

            <div className="queue-filter-tabs" aria-label="Filtrar fila por prioridade">
              {(
                [
                  ['TODOS', 'Todos'],
                  ['PRIMARIA', 'Primária'],
                  ['SECUNDARIA', 'Secundária'],
                  ['TERCIARIA', 'Terciária'],
                ] as const
              ).map(([value, label]) => (
                <button
                  className={queueFilter === value ? 'selected' : ''}
                  onClick={() => setQueueFilter(value)}
                  key={value}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="dashboard-queue-list">
            {filteredQueue.map((item) => {
              const waiting = diasDeEspera(item.dataEntrega)

              return (
                <button
                  className={`dashboard-queue-item ${item.prioridade === 'PRIMARIA' ? 'is-primary' : ''}`}
                  key={item.id}
                  onClick={() => navigate(`/encaminhamentos/${item.id}`, { state: { from: '/' } })}
                  aria-label={getReferralActionLabel(item.pacienteNome)}
                >
                  <span className="queue-position">
                    {String(fullQueue.indexOf(item) + 1).padStart(2, '0')}
                  </span>

                  <div className="queue-person">
                    <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                    <p>
                      {item.patologia || 'Patologia não informada'} <i />{' '}
                      {item.tipoAtendimento || 'Tipo não informado'}
                    </p>
                  </div>

                  <span className={`queue-priority priority-${tomPrioridade(item.prioridade)}`}>
                    <b>{priorityCode[item.prioridade] ?? '—'}</b>
                    {obterRotuloPrioridade(item.prioridade)}
                  </span>

                  <div className="queue-date">
                    <span>Entrada</span>
                    <strong>{formatarData(item.dataEntrega)}</strong>
                  </div>

                  <div className={`queue-wait ${waiting >= 14 ? 'is-overdue' : ''}`}>
                    <strong>{waiting} dias</strong>
                    <span>aguardando</span>
                  </div>
                </button>
              )
            })}

            {!filteredQueue.length && (
              <div className="empty-state">
                <ClipboardPlus size={25} />
                <strong>Nenhum encaminhamento nesta prioridade</strong>
                <p>Use outro filtro para consultar a fila atual.</p>
              </div>
            )}
          </div>

          <footer className="queue-panel-footer">
            <span>
              Exibindo {filteredQueue.length} de {fullQueue.length} encaminhamentos
            </span>
            <button onClick={() => navigate('/encaminhamentos?status=NA_FILA')}>
              Ver fila completa <ChevronRight size={17} />
            </button>
          </footer>
        </section>

        <aside className="panel dashboard-agenda-panel">
          <div className="panel-heading">
            <div>
              <h2>Agenda de hoje</h2>
              <p>
                {todayAppointments.length === 1
                  ? '1 atendimento programado'
                  : `${todayAppointments.length} atendimentos programados`}
              </p>
            </div>
          </div>

          <div className="compact-agenda-list">
            {todayAppointments.slice(0, 5).map((item) => (
              <article className="compact-agenda-item" key={item.id}>
                <time>{item.dataHora?.slice(11, 16) || '—'}</time>
                <span className="compact-agenda-avatar" aria-hidden="true">
                  {iniciais(item.pacienteNome)}
                </span>
                <div className="compact-agenda-info">
                  <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                  <span>Fisioterapeuta: {item.fisioterapeutaNome || 'Não informado'}</span>
                </div>
              </article>
            ))}

            {!todayAppointments.length && (
              <div className="empty-state compact-empty">
                <CalendarDays size={24} />
                <strong>Nenhuma consulta hoje</strong>
                <p>A agenda está livre para novos atendimentos.</p>
              </div>
            )}
          </div>

          <button className="agenda-full-button" onClick={() => navigate('/consultas')}>
            Ver agenda completa <ChevronRight size={17} />
          </button>
        </aside>
      </div>
    </section>
  )
}

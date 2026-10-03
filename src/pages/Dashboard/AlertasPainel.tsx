import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, BellRing, CalendarClock, ChevronRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { dataLocal, diasDeEspera, formatarDataHora, obterRotuloPrioridade } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import type { Prioridade } from '../../types/modelos'

const alertWaitLimit: Record<Prioridade, number> = { PRIMARIA: 14, SECUNDARIA: 27, TERCIARIA: 30 }

export function AlertasPainel() {
  const navigate = useNavigate()
  const location = useLocation()
  const queue = useQuery({
    queryKey: ['referrals', 'queue'],
    queryFn: servicoEncaminhamento.listarFila,
  })
  const appointments = useQuery({
    queryKey: ['appointments'],
    queryFn: servicoConsulta.listar,
  })

  if (queue.isLoading || appointments.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando alertas..." />
      </section>
    )
  if (queue.isError || appointments.isError)
    return (
      <section className="page-content">
        <ApiError
          error={queue.error ?? appointments.error}
          retry={() => {
            void queue.refetch()
            void appointments.refetch()
          }}
        />
      </section>
    )

  const referralAlerts = (queue.data ?? []).filter(
    (item) => diasDeEspera(item.dataEntrega) > alertWaitLimit[item.prioridade],
  )
  const today = dataLocal()
  const overdueAppointments = (appointments.data ?? [])
    .filter(
      (item) =>
        item.status === 'AGENDADA' &&
        item.dataHora.slice(0, 10) < today,
    )
    .sort((first, second) => first.dataHora.localeCompare(second.dataHora))
  const alertCount = referralAlerts.length + overdueAppointments.length
  const currentPath = `${location.pathname}${location.search}`

  return (
    <EstruturaSubpagina
      eyebrow="CENTRAL OPERACIONAL"
      title="Alertas"
      description="Casos que necessitam de atenção"
      fallback="/"
      backLabel="a visão geral"
    >
      <div className="dashboard-alert-center subpage-alert-center">
        <div className="dashboard-alert-summary">
          <span className={alertCount ? 'is-critical' : ''}>
            <AlertTriangle size={24} />
          </span>
          <div>
            <strong>
              {alertCount
                ? `${alertCount} ${alertCount === 1 ? 'caso requer' : 'casos requerem'} atenção`
                : 'Nenhuma prioridade crítica'}
            </strong>
            <p>
              {alertCount
                ? 'Revise os casos e consultas pendentes abaixo.'
                : 'A fila e os registros de consultas estão em dia.'}
            </p>
          </div>
        </div>
        {referralAlerts.length > 0 && (
          <section className="dashboard-alert-group">
            <header>
              <div>
                <AlertTriangle size={19} />
                <strong>Fila de encaminhamentos</strong>
              </div>
              <span>{referralAlerts.length}</span>
            </header>
            <div className="dashboard-alert-list">
              {referralAlerts.map((item) => {
                const waiting = diasDeEspera(item.dataEntrega)
                return (
                  <button
                    className={`dashboard-alert-item ${item.prioridade === 'PRIMARIA' ? 'critical' : 'warning'}`}
                    onClick={() =>
                      navigate(`/encaminhamentos/${item.id}`, {
                        state: { from: currentPath },
                      })
                    }
                    key={item.id}
                  >
                    <span>
                      <AlertTriangle size={20} />
                    </span>
                    <div>
                      <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                      <p>
                        Prioridade{' '}
                        {obterRotuloPrioridade(item.prioridade).toLocaleLowerCase('pt-BR')} •{' '}
                        {waiting} dias aguardando
                      </p>
                    </div>
                    <ChevronRight size={19} />
                  </button>
                )
              })}
            </div>
          </section>
        )}
        {overdueAppointments.length > 0 && (
          <section className="dashboard-alert-group">
            <header>
              <div>
                <CalendarClock size={19} />
                <strong>Consultas de dias anteriores sem baixa</strong>
              </div>
              <span>{overdueAppointments.length}</span>
            </header>
            <div className="dashboard-alert-list">
              {overdueAppointments.map((item) => (
                <button
                  className="dashboard-alert-item warning"
                  onClick={() =>
                    navigate(`/consultas/${item.id}`, { state: { from: currentPath } })
                  }
                  key={item.id}
                >
                  <span>
                    <CalendarClock size={20} />
                  </span>
                  <div>
                    <strong>{item.pacienteNome || 'Paciente não informado'}</strong>
                    <p>{formatarDataHora(item.dataHora)} • aguardando baixa</p>
                  </div>
                  <ChevronRight size={19} />
                </button>
              ))}
            </div>
          </section>
        )}
        {!alertCount && (
          <div className="empty-state dashboard-alert-empty">
            <BellRing size={30} />
            <strong>Nenhum alerta na fila</strong>
            <p>A equipe está com os prazos de espera e consultas em dia.</p>
          </div>
        )}
      </div>
    </EstruturaSubpagina>
  )
}

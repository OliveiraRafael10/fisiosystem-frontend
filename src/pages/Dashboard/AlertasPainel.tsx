import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, BellRing, ChevronRight } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { diasDeEspera, obterRotuloPrioridade } from '../../lib/dominio'
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

  if (queue.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando alertas..." />
      </section>
    )
  if (queue.isError)
    return (
      <section className="page-content">
        <ApiError error={queue.error} retry={() => void queue.refetch()} />
      </section>
    )

  const alerts = (queue.data ?? []).filter(
    (item) => diasDeEspera(item.dataEntrega) > alertWaitLimit[item.prioridade],
  )

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
          <span className={alerts.length ? 'is-critical' : ''}>
            <AlertTriangle size={24} />
          </span>
          <div>
            <strong>
              {alerts.length
                ? `${alerts.length} ${alerts.length === 1 ? 'caso requer' : 'casos requerem'} atenção`
                : 'Nenhuma prioridade crítica'}
            </strong>
            <p>
              {alerts.length
                ? 'Revise os casos abaixo e defina o próximo atendimento.'
                : 'A fila não possui casos críticos neste momento.'}
            </p>
          </div>
        </div>
        {alerts.length > 0 && (
          <section className="dashboard-alert-group">
            <header>
              <div>
                <AlertTriangle size={19} />
                <strong>Fila de encaminhamentos</strong>
              </div>
              <span>{alerts.length}</span>
            </header>
            <div className="dashboard-alert-list">
              {alerts.map((item) => {
                const waiting = diasDeEspera(item.dataEntrega)
                return (
                  <button
                    className={`dashboard-alert-item ${item.prioridade === 'PRIMARIA' ? 'critical' : 'warning'}`}
                    onClick={() =>
                      navigate(`/encaminhamentos/${item.id}`, {
                        state: { from: location.pathname },
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
        {!alerts.length && (
          <div className="empty-state dashboard-alert-empty">
            <BellRing size={30} />
            <strong>Nenhum alerta na fila</strong>
            <p>A equipe está com os prazos de espera em dia.</p>
          </div>
        )}
      </div>
    </EstruturaSubpagina>
  )
}

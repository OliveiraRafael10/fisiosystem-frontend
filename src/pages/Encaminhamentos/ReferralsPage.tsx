import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Clock3,
  MoreHorizontal,
  Plus,
  Search,
  Siren,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/ApiState'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  daysWaiting,
  getPrioridadeLabel,
  getStatusEncaminhamentoLabel,
  initials,
  priorityTone,
} from '../../lib/domain'
import { referralService } from '../../services/referralService'
import type { StatusEncaminhamento } from '../../types'

export function ReferralsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'TODOS' | StatusEncaminhamento>(() =>
    ['NA_FILA', 'ASSUMIDO', 'EM_TRATAMENTO', 'ALTA', 'RETIRADO_PELO_PACIENTE'].includes(
      requestedStatus ?? '',
    )
      ? (requestedStatus as StatusEncaminhamento)
      : 'TODOS',
  )
  const isQueueView = status === 'NA_FILA'
  const referrals = useQuery({
    queryKey: ['referrals', isQueueView ? 'queue' : 'list'],
    queryFn: () => (isQueueView ? referralService.queue() : referralService.list()),
  })
  const indicators = useQuery({
    queryKey: ['referrals', 'indicators'],
    queryFn: referralService.indicators,
  })
  const priority = useQuery({
    queryKey: ['referrals', 'queue-priority'],
    queryFn: referralService.queuePriorityIndicators,
  })

  const filtered = useMemo(
    () =>
      (referrals.data ?? []).filter((item) => {
        const term = query.toLocaleLowerCase('pt-BR')
        const matches =
          (item.pacienteNome ?? '').toLocaleLowerCase('pt-BR').includes(term) ||
          (item.patologia ?? '').toLocaleLowerCase('pt-BR').includes(term) ||
          String(item.id).includes(term)
        return matches && (status === 'TODOS' || item.statusEncaminhamento === status)
      }),
    [referrals.data, query, status],
  )

  const queries = [referrals, indicators, priority]
  const errorQuery = queries.find((item) => item.isError)
  if (queries.some((item) => item.isLoading))
    return (
      <section className="page-content">
        <ApiLoading label="Organizando a fila clínica..." />
      </section>
    )
  if (errorQuery)
    return (
      <section className="page-content">
        <ApiError
          error={errorQuery.error}
          retry={() => queries.forEach((item) => void item.refetch())}
        />
      </section>
    )

  const currentPath = `${location.pathname}${location.search}`
  return (
    <section className="page-content">
      <PageHeader
        eyebrow="REGULAÇÃO"
        title="Encaminhamentos"
        description="Fila, prioridades e transições controladas pelas regras do Spring."
        actions={
          <button
            className="primary-button page-primary"
            onClick={() => navigate('/encaminhamentos/novo', { state: { from: currentPath } })}
          >
            <Plus size={18} /> Novo encaminhamento
          </button>
        }
      />
      <div className="metric-row">
        <article>
          <span className="metric-icon peach">
            <Clock3 />
          </span>
          <div>
            <strong>{indicators.data?.naFila ?? 0}</strong>
            <p>Aguardando vaga</p>
          </div>
          <em>Fila atual</em>
        </article>
        <article>
          <span className="metric-icon red">
            <Siren />
          </span>
          <div>
            <strong>{priority.data?.primaria ?? 0}</strong>
            <p>Prioridade primária</p>
          </div>
          <em>Requer atenção</em>
        </article>
        <article>
          <span className="metric-icon mint">
            <ClipboardCheck />
          </span>
          <div>
            <strong>{indicators.data?.emTratamento ?? 0}</strong>
            <p>Em tratamento</p>
          </div>
          <em>{indicators.data?.assumidos ?? 0} assumidos</em>
        </article>
        <article>
          <span className="metric-icon blue">
            <Building2 />
          </span>
          <div>
            <strong>{indicators.data?.altas ?? 0}</strong>
            <p>Altas registradas</p>
          </div>
          <em>{indicators.data?.total ?? 0} no total</em>
        </article>
      </div>
      <section className="data-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar paciente, patologia ou protocolo..."
            />
          </label>
          <div className="filter-tabs">
            {(
              [
                ['TODOS', 'Todos'],
                ['NA_FILA', 'Na fila'],
                ['ASSUMIDO', 'Assumidos'],
                ['EM_TRATAMENTO', 'Em tratamento'],
                ['ALTA', 'Alta'],
              ] as const
            ).map(([value, label]) => (
              <button
                className={status === value ? 'selected' : ''}
                onClick={() => setStatus(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table referral-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Paciente</th>
                <th>Patologia</th>
                <th>Médico</th>
                <th>Prioridade</th>
                <th>Espera</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((referral) => (
                <tr
                  key={referral.id}
                  onClick={() =>
                    navigate(`/encaminhamentos/${referral.id}`, { state: { from: currentPath } })
                  }
                >
                  <td>
                    <span className="protocol">#{referral.id}</span>
                  </td>
                  <td>
                    <div className="person-cell compact">
                      <span className="patient-avatar">{initials(referral.pacienteNome)}</span>
                      <div>
                        <strong>{referral.pacienteNome || 'Paciente não informado'}</strong>
                        <small>{referral.tipoAtendimento || 'Tipo não informado'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{referral.patologia || 'Não informada'}</td>
                  <td>{referral.medicoSolicitante || 'Não informado'}</td>
                  <td>
                    <span className={`priority-pill priority-${priorityTone(referral.prioridade)}`}>
                      {getPrioridadeLabel(referral.prioridade)}
                    </span>
                  </td>
                  <td>
                    <span className={daysWaiting(referral.dataEntrega) >= 8 ? 'wait-danger' : ''}>
                      {referral.statusEncaminhamento === 'NA_FILA'
                        ? `${daysWaiting(referral.dataEntrega)} dias`
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <StatusBadge>
                      {getStatusEncaminhamentoLabel(referral.statusEncaminhamento)}
                    </StatusBadge>
                  </td>
                  <td>
                    <button
                      className="table-more"
                      aria-label={`Abrir encaminhamento ${referral.id}`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">
              <ClipboardCheck size={25} />
              <strong>Nenhum encaminhamento encontrado</strong>
              <p>A fila não possui registros para estes filtros.</p>
            </div>
          )}
        </div>
        <footer className="table-footer">
          <span>{filtered.length} encaminhamentos encontrados</span>
          <button className="text-button">
            Dados atualizados <ArrowUpRight size={14} />
          </button>
        </footer>
      </section>
    </section>
  )
}

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
import { CartaoMetricaEncaminhamento } from '../../components/referrals/CartaoMetricaEncaminhamento'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import { SeloStatus } from '../../components/ui/SeloStatus'
import {
  diasDeEspera,
  obterRotuloPrioridade,
  obterRotuloStatusEncaminhamento,
  iniciais,
  tomPrioridade,
} from '../../lib/dominio'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import type { StatusEncaminhamento } from '../../types/modelos'

export function PaginaEncaminhamentos() {
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
    queryFn: () => (isQueueView ? servicoEncaminhamento.listarFila() : servicoEncaminhamento.listar()),
  })
  const indicators = useQuery({
    queryKey: ['referrals', 'indicators'],
    queryFn: servicoEncaminhamento.obterIndicadores,
  })
  const priority = useQuery({
    queryKey: ['referrals', 'queue-priority'],
    queryFn: servicoEncaminhamento.listarFilaPriorityIndicators,
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
  const metrics = [
    {
      icon: Clock3,
      label: 'Aguardando vaga',
      supportingText: 'Fila atual',
      tone: 'orange' as const,
      value: indicators.data?.naFila ?? 0,
    },
    {
      icon: Siren,
      label: 'Prioridade primária',
      supportingText: 'Requer atenção',
      tone: 'red' as const,
      value: priority.data?.primaria ?? 0,
    },
    {
      icon: ClipboardCheck,
      label: 'Em tratamento',
      supportingText: `${indicators.data?.assumidos ?? 0} assumidos`,
      tone: 'green' as const,
      value: indicators.data?.emTratamento ?? 0,
    },
    {
      icon: Building2,
      label: 'Altas registradas',
      supportingText: `${indicators.data?.total ?? 0} no total`,
      tone: 'blue' as const,
      value: indicators.data?.altas ?? 0,
    },
  ]

  return (
    <section className="page-content">
      <CabecalhoPagina
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
      <div className="mb-5 grid grid-cols-1 gap-4 min-[680px]:grid-cols-2 min-[1180px]:grid-cols-4">
        {metrics.map((metric) => (
          <CartaoMetricaEncaminhamento key={metric.label} {...metric} />
        ))}
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
                      <span className="patient-avatar">{iniciais(referral.pacienteNome)}</span>
                      <div>
                        <strong>{referral.pacienteNome || 'Paciente não informado'}</strong>
                        <small>{referral.tipoAtendimento || 'Tipo não informado'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{referral.patologia || 'Não informada'}</td>
                  <td>{referral.medicoSolicitante || 'Não informado'}</td>
                  <td>
                    <span className={`priority-pill priority-${tomPrioridade(referral.prioridade)}`}>
                      {obterRotuloPrioridade(referral.prioridade)}
                    </span>
                  </td>
                  <td>
                    <span className={diasDeEspera(referral.dataEntrega) >= 8 ? 'wait-danger' : ''}>
                      {referral.statusEncaminhamento === 'NA_FILA'
                        ? `${diasDeEspera(referral.dataEntrega)} dias`
                        : '—'}
                    </span>
                  </td>
                  <td>
                    <SeloStatus>
                      {obterRotuloStatusEncaminhamento(referral.statusEncaminhamento)}
                    </SeloStatus>
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

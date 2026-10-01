import { useQueries, useQuery } from '@tanstack/react-query'
import { CalendarDays, FileText, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DatePicker } from '../../components/appointments/SeletorDataHora'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import { dataLocal } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'

function monthsRange() {
  return Array.from({ length: 6 }, (_, reverseIndex) => {
    const offset = 5 - reverseIndex
    const date = new Date()
    date.setMonth(date.getMonth() - offset, 1)
    const start = dataLocal(date)
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return {
      start,
      end: dataLocal(endDate),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
    }
  })
}

export function PaginaRelatorios() {
  const initialStart = `${new Date().getFullYear()}-01-01`
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(dataLocal())
  const period = useQuery({
    queryKey: ['appointments', 'period-indicators', start, end],
    queryFn: () => servicoConsulta.obterIndicadoresPeriodo(start, end),
  })
  const absence = useQuery({
    queryKey: ['appointments', 'absence-rate', start, end],
    queryFn: () => servicoConsulta.obterTaxaFaltas(start, end),
  })
  const referralIndicators = useQuery({
    queryKey: ['referrals', 'indicators'],
    queryFn: servicoEncaminhamento.obterIndicadores,
  })
  const priority = useQuery({
    queryKey: ['referrals', 'queue-priority'],
    queryFn: servicoEncaminhamento.listarFilaPriorityIndicators,
  })
  const averageWait = useQuery({
    queryKey: ['referrals', 'average-wait'],
    queryFn: servicoEncaminhamento.obterTempoMedioEspera,
  })
  const months = useMemo(monthsRange, [])
  const monthlyQueries = useQueries({
    queries: months.map((month) => ({
      queryKey: ['appointments', 'period-indicators', month.start, month.end],
      queryFn: () => servicoConsulta.obterIndicadoresPeriodo(month.start, month.end),
    })),
  })
  const queries = [period, absence, referralIndicators, priority, averageWait, ...monthlyQueries]
  const errorQuery = queries.find((item) => item.isError)

  if (queries.some((item) => item.isLoading))
    return (
      <section className="page-content">
        <ApiLoading label="Calculando indicadores..." />
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

  const monthlyPerformance = months.map((month, index) => ({
    month: month.month,
    atendimentos: monthlyQueries[index].data?.realizadas ?? 0,
    agendadas: monthlyQueries[index].data?.agendadas ?? 0,
  }))
  const attendanceData = [
    { label: 'Realizadas', value: period.data?.realizadas ?? 0, color: '#167f79' },
    { label: 'Faltas', value: period.data?.faltas ?? 0, color: '#e19a62' },
    { label: 'Canceladas', value: period.data?.canceladas ?? 0, color: '#d6dfdd' },
  ]
  const priorityData = [
    { name: 'Alta', value: priority.data?.primaria ?? 0, color: '#cf6049' },
    { name: 'Média', value: priority.data?.secundaria ?? 0, color: '#e19a62' },
    { name: 'Baixa', value: priority.data?.terciaria ?? 0, color: '#167f79' },
  ]
  const completedExpected = (absence.data?.realizadas ?? 0) + (absence.data?.faltas ?? 0)
  const attendanceRate = completedExpected ? 100 - (absence.data?.taxaFaltas ?? 0) : 0

  return (
    <section className="page-content">
      <CabecalhoPagina
        eyebrow="INTELIGÊNCIA DA UNIDADE"
        title="Relatórios"
        description="Indicadores calculados diretamente pela API do FisioSystem."
        actions={
          <div className="report-date-fields">
            <div className="field">
              <DatePicker
                label="Início"
                value={start}
                variant="compact"
                onChange={(value) => {
                  setStart(value)
                  if (value > end) setEnd(value)
                }}
              />
            </div>
            <div className="field">
              <DatePicker
                align="right"
                label="Fim"
                value={end}
                variant="compact"
                onChange={(value) => {
                  setEnd(value)
                  if (value < start) setStart(value)
                }}
              />
            </div>
          </div>
        }
      />
      <div className="report-kpis">
        <article>
          <span>Consultas no período</span>
          <strong>{period.data?.total ?? 0}</strong>
          <p className="trend-up">
            <TrendingUp size={14} /> {period.data?.realizadas ?? 0} <em>realizadas</em>
          </p>
        </article>
        <article>
          <span>Taxa de comparecimento</span>
          <strong>{attendanceRate.toFixed(1)}%</strong>
          <p>
            <em>Entre realizadas e faltas</em>
          </p>
        </article>
        <article>
          <span>Tempo médio de espera</span>
          <strong>
            {(averageWait.data ?? 0).toFixed(1)} <small>dias</small>
          </strong>
          <p>
            <em>Da entrega à assunção</em>
          </p>
        </article>
        <article>
          <span>Altas terapêuticas</span>
          <strong>{referralIndicators.data?.altas ?? 0}</strong>
          <p>
            <em>{referralIndicators.data?.emTratamento ?? 0} casos em tratamento</em>
          </p>
        </article>
      </div>
      <div className="report-grid">
        <section className="panel chart-panel wide-chart">
          <div className="chart-heading">
            <div>
              <h2>Evolução dos atendimentos</h2>
              <p>Consultas realizadas nos últimos seis meses</p>
            </div>
            <span className="chart-growth">
              <TrendingUp size={15} /> Dados reais
            </span>
          </div>
          <div className="main-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance} margin={{ left: -20, right: 10, top: 12 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#167f79" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#167f79" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9efed" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="atendimentos"
                  name="Realizadas"
                  stroke="#167f79"
                  strokeWidth={3}
                  fill="url(#attendanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="chart-heading">
            <div>
              <h2>Prioridade da fila</h2>
              <p>Encaminhamentos aguardando vaga</p>
            </div>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="55%" height={190}>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={77}
                  paddingAngle={3}
                  stroke="none"
                >
                  {priorityData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{referralIndicators.data?.naFila ?? 0}</strong>
              <span>na fila</span>
            </div>
            <div className="chart-legend">
              {priorityData.map((item) => (
                <div key={item.name}>
                  <span>
                    <i style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel chart-panel">
          <div className="chart-heading">
            <div>
              <h2>Adesão aos atendimentos</h2>
              <p>Resultado do período selecionado</p>
            </div>
          </div>
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ left: -30, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9efed" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[7, 7, 0, 0]}>
                  {attendanceData.map((item) => (
                    <Cell key={item.label} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel insights-panel">
          <div className="chart-heading">
            <div>
              <h2>Leitura operacional</h2>
              <p>Resumo do estado atual da unidade</p>
            </div>
          </div>
          <div className="insight-item positive-insight">
            <span>01</span>
            <div>
              <strong>{period.data?.realizadas ?? 0} atendimentos concluídos</strong>
              <p>
                No intervalo definido entre{' '}
                {new Date(`${start}T12:00:00`).toLocaleDateString('pt-BR')} e{' '}
                {new Date(`${end}T12:00:00`).toLocaleDateString('pt-BR')}.
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span>02</span>
            <div>
              <strong>{absence.data?.faltas ?? 0} faltas registradas</strong>
              <p>
                A taxa de faltas calculada pelo backend é{' '}
                {(absence.data?.taxaFaltas ?? 0).toFixed(1)}%.
              </p>
            </div>
          </div>
          <div className="insight-item">
            <span>03</span>
            <div>
              <strong>{priority.data?.primaria ?? 0} casos de alta prioridade</strong>
              <p>Encaminhamentos primários que permanecem na fila.</p>
            </div>
          </div>
        </section>
      </div>
      <section className="reports-library">
        <div>
          <span>
            <FileText size={19} />
          </span>
          <div>
            <h2>Fonte dos indicadores</h2>
            <p>
              Consultas, encaminhamentos, prioridades e tempo de espera são calculados pela API
              Spring.
            </p>
          </div>
        </div>
        <div className="report-file">
          <div>
            <strong>Período analisado</strong>
            <span>
              <CalendarDays size={14} /> {start} a {end}
            </span>
          </div>
        </div>
      </section>
    </section>
  )
}

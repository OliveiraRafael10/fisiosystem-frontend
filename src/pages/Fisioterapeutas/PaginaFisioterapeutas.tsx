import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, MoreHorizontal, Phone, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { iniciais } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoFisioterapeuta } from '../../services/servicoFisioterapeuta'

export function PaginaFisioterapeutas() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>(() =>
    searchParams.get('status') === 'ativos'
      ? 'ativos'
      : searchParams.get('status') === 'inativos'
        ? 'inativos'
        : 'todos',
  )
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: servicoFisioterapeuta.listar })
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: servicoConsulta.listar })
  const filtered = useMemo(
    () =>
      (therapists.data ?? []).filter((item) => {
        const matchesQuery =
          item.nome.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) ||
          (item.crefito ?? '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
        return (
          matchesQuery && (filter === 'todos' || (filter === 'ativos' ? item.ativo : !item.ativo))
        )
      }),
    [therapists.data, query, filter],
  )

  if (therapists.isLoading || appointments.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando a equipe clínica..." />
      </section>
    )
  if (therapists.isError || appointments.isError)
    return (
      <section className="page-content">
        <ApiError
          error={therapists.error ?? appointments.error}
          retry={() => {
            void therapists.refetch()
            void appointments.refetch()
          }}
        />
      </section>
    )

  const currentPath = `${location.pathname}${location.search}`
  return (
    <section className="page-content">
      <CabecalhoPagina
        eyebrow="EQUIPE CLÍNICA"
        title="Fisioterapeutas"
        description="Profissionais, CREFITO e situação funcional vindos da API."
        actions={
          <button
            className="primary-button page-primary"
            onClick={() => navigate('/fisioterapeutas/novo', { state: { from: currentPath } })}
          >
            <Plus size={18} /> Novo profissional
          </button>
        }
      />
      <div className="team-toolbar">
        <label className="table-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar profissional ou CREFITO..."
          />
        </label>
        <div className="filter-tabs">
          <button
            className={filter === 'todos' ? 'selected' : ''}
            onClick={() => setFilter('todos')}
          >
            Todos
          </button>
          <button
            className={filter === 'ativos' ? 'selected' : ''}
            onClick={() => setFilter('ativos')}
          >
            Ativos
          </button>
          <button
            className={filter === 'inativos' ? 'selected' : ''}
            onClick={() => setFilter('inativos')}
          >
            Inativos
          </button>
        </div>
      </div>
      <div className="therapist-grid">
        {filtered.map((therapist, index) => {
          const count =
            appointments.data?.filter((item) => item.fisioterapeutaId === therapist.id).length ?? 0
          const colors = ['mint', 'blue', 'violet', 'peach']
          const color = colors[index % colors.length]
          return (
            <article className="therapist-card" key={therapist.id}>
              <div className={`therapist-cover cover-${color}`}>
                <span className={`therapist-avatar avatar-${color}`}>
                  {iniciais(therapist.nome)}
                </span>
                <button
                  onClick={() =>
                    navigate(`/fisioterapeutas/${therapist.id}`, { state: { from: currentPath } })
                  }
                  aria-label={`Gerenciar ${therapist.nome}`}
                >
                  <MoreHorizontal size={19} />
                </button>
              </div>
              <div className="therapist-body">
                <div className="therapist-name">
                  <div>
                    <h2>{therapist.nome}</h2>
                    <p>{therapist.crefito || 'CREFITO não informado'}</p>
                  </div>
                  <SeloStatus>{therapist.ativo ? 'Ativo' : 'Inativo'}</SeloStatus>
                </div>
                <span className="specialty-label">Fisioterapia</span>
                <div className="contact-lines">
                  <span>
                    <Phone size={14} /> {therapist.telefone || 'Telefone não informado'}
                  </span>
                </div>
                <footer>
                  <span>
                    <CalendarCheck size={16} />
                    <strong>{count}</strong> consultas registradas
                  </span>
                  <button
                    onClick={() =>
                      navigate(`/fisioterapeutas/${therapist.id}`, { state: { from: currentPath } })
                    }
                  >
                    Gerenciar
                  </button>
                </footer>
              </div>
            </article>
          )
        })}
        <button
          className="add-therapist-card"
          onClick={() => navigate('/fisioterapeutas/novo', { state: { from: currentPath } })}
        >
          <span>
            <Plus size={23} />
          </span>
          <strong>Adicionar fisioterapeuta</strong>
          <p>Cadastre um novo profissional na equipe.</p>
        </button>
      </div>
    </section>
  )
}

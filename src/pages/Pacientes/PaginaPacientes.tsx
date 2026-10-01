import { useQuery } from '@tanstack/react-query'
import { ClipboardPlus, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { CabecalhoPagina } from '../../components/ui/CabecalhoPagina'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { formatarData, iniciais } from '../../lib/dominio'
import { servicoPaciente } from '../../services/servicoPaciente'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'

export function PaginaPacientes() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('busca') ?? '')
  const patients = useQuery({ queryKey: ['patients'], queryFn: servicoPaciente.listar })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: servicoEncaminhamento.listar })

  useEffect(() => setQuery(searchParams.get('busca') ?? ''), [searchParams])

  const filtered = useMemo(
    () =>
      (patients.data ?? []).filter((patient) => {
        const term = query.toLocaleLowerCase('pt-BR')
        return (
          patient.nome.toLocaleLowerCase('pt-BR').includes(term) ||
          patient.numeroSus.includes(query)
        )
      }),
    [patients.data, query],
  )

  function updateSearch(value: string) {
    setQuery(value)
    if (value) setSearchParams({ busca: value })
    else setSearchParams({})
  }

  if (patients.isLoading || referrals.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando prontuários..." />
      </section>
    )
  if (patients.isError || referrals.isError)
    return (
      <section className="page-content">
        <ApiError
          error={patients.error ?? referrals.error}
          retry={() => {
            void patients.refetch()
            void referrals.refetch()
          }}
        />
      </section>
    )

  const patientsInTreatment = new Set(
    (referrals.data ?? [])
      .filter((item) => item.statusEncaminhamento === 'EM_TRATAMENTO')
      .map((item) => item.pacienteId),
  ).size
  const patientsWaiting = new Set(
    (referrals.data ?? [])
      .filter((item) => item.statusEncaminhamento === 'NA_FILA')
      .map((item) => item.pacienteId),
  ).size
  const currentPath = `${location.pathname}${location.search}`

  return (
    <section className="page-content">
      <CabecalhoPagina
        eyebrow="ATENDIMENTO"
        title="Pacientes"
        description="Prontuários sincronizados com os cadastros do backend."
        actions={
          <button
            className="primary-button page-primary"
            onClick={() => navigate('/pacientes/novo', { state: { from: currentPath } })}
          >
            <Plus size={18} /> Cadastrar paciente
          </button>
        }
      />
      <div className="list-summary">
        <div>
          <strong>{patients.data?.length ?? 0}</strong>
          <span>Pacientes cadastrados</span>
        </div>
        <i />
        <div>
          <strong>{patientsInTreatment}</strong>
          <span>Em tratamento</span>
        </div>
        <i />
        <div>
          <strong>{patientsWaiting}</strong>
          <span>Aguardando vaga</span>
        </div>
        <i />
        <div>
          <strong>
            {referrals.data?.filter((item) => item.statusEncaminhamento === 'ALTA').length ?? 0}
          </strong>
          <span>Altas registradas</span>
        </div>
      </div>
      <section className="data-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar por nome ou número SUS..."
            />
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Número SUS</th>
                <th>Contato</th>
                <th>Entrada</th>
                <th>Encaminhamentos</th>
                <th>Situação</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => {
                const linked = (referrals.data ?? []).filter(
                  (item) => item.pacienteId === patient.id,
                )
                const active = linked.find((item) =>
                  ['ASSUMIDO', 'EM_TRATAMENTO'].includes(item.statusEncaminhamento),
                )
                const waiting = linked.find((item) => item.statusEncaminhamento === 'NA_FILA')
                const situation = active
                  ? 'Em tratamento'
                  : waiting
                    ? 'Aguardando vaga'
                    : linked.length
                      ? 'Alta'
                      : 'Sem encaminhamento'
                return (
                  <tr
                    key={patient.id}
                    onClick={() =>
                      navigate(`/pacientes/${patient.id}`, { state: { from: currentPath } })
                    }
                  >
                    <td>
                      <div className="person-cell">
                        <span className="patient-avatar large">{iniciais(patient.nome)}</span>
                        <div>
                          <strong>{patient.nome}</strong>
                          <small>{patient.endereco || 'Endereço não informado'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="mono-text">{patient.numeroSus}</span>
                    </td>
                    <td>{patient.telefone || '—'}</td>
                    <td>{formatarData(patient.dataEntrada)}</td>
                    <td>
                      <span className="referral-count">
                        <ClipboardPlus size={14} /> {linked.length}
                      </span>
                    </td>
                    <td>
                      <SeloStatus>{situation}</SeloStatus>
                    </td>
                    <td>
                      <button
                        className="table-more"
                        aria-label={`Abrir prontuário de ${patient.nome}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="empty-state">
              <Search size={26} />
              <strong>Nenhum paciente encontrado</strong>
              <p>Altere o termo de busca ou cadastre um novo paciente.</p>
            </div>
          )}
        </div>
        <footer className="table-footer">
          <span>
            Mostrando {filtered.length} de {patients.data?.length ?? 0} pacientes
          </span>
        </footer>
      </section>
    </section>
  )
}

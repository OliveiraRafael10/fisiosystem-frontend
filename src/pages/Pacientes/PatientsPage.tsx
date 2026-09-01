import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ClipboardPlus, MapPin, MoreHorizontal, Phone, Plus, Search, UserRound, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDate, initials, localDate, prioridadeLabel, statusEncaminhamentoLabel } from '../../lib/domain'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'
import type { Paciente, PacienteInput } from '../../types'

const emptyForm: PacienteInput = { nome: '', numeroSus: '', dataNascimento: '', dataEntrada: localDate(), telefone: '', endereco: '' }

export function PatientsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('busca') ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Paciente | null>(null)
  const [editing, setEditing] = useState<Paciente | null>(null)
  const [form, setForm] = useState<PacienteInput>(emptyForm)
  const [saved, setSaved] = useState(false)
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const saveMutation = useMutation({
    mutationFn: () => editing ? patientService.update(editing.id, form) : patientService.create(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] })
      setFormOpen(false)
      setEditing(null)
      setForm(emptyForm)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3500)
    },
  })

  useEffect(() => setQuery(searchParams.get('busca') ?? ''), [searchParams])
  useEffect(() => {
    const openForm = () => openCreate()
    window.addEventListener('fisio:new-patient', openForm)
    return () => window.removeEventListener('fisio:new-patient', openForm)
  })

  const filtered = useMemo(() => (patients.data ?? []).filter((patient) => {
    const term = query.toLocaleLowerCase('pt-BR')
    return patient.nome.toLocaleLowerCase('pt-BR').includes(term) || patient.numeroSus.includes(query)
  }), [patients.data, query])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    saveMutation.reset()
    setFormOpen(true)
  }

  function openEdit(patient: Paciente) {
    setEditing(patient)
    setForm({ numeroSus: patient.numeroSus, nome: patient.nome, dataNascimento: patient.dataNascimento ?? '', dataEntrada: patient.dataEntrada ?? localDate(), telefone: patient.telefone ?? '', endereco: patient.endereco ?? '' })
    saveMutation.reset()
    setSelected(null)
    setFormOpen(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    saveMutation.mutate()
  }

  function updateSearch(value: string) {
    setQuery(value)
    if (value) setSearchParams({ busca: value })
    else setSearchParams({})
  }

  if (patients.isLoading || referrals.isLoading) return <section className="page-content"><ApiLoading label="Carregando prontuários..." /></section>
  if (patients.isError || referrals.isError) return <section className="page-content"><ApiError error={patients.error ?? referrals.error} retry={() => { void patients.refetch(); void referrals.refetch() }} /></section>

  const patientReferrals = selected ? (referrals.data ?? []).filter((item) => item.pacienteId === selected.id) : []
  const patientsInTreatment = new Set((referrals.data ?? []).filter((item) => item.statusEncaminhamento === 'EM_TRATAMENTO').map((item) => item.pacienteId)).size
  const patientsWaiting = new Set((referrals.data ?? []).filter((item) => item.statusEncaminhamento === 'NA_FILA').map((item) => item.pacienteId)).size

  return (
    <section className="page-content">
      <PageHeader eyebrow="ATENDIMENTO" title="Pacientes" description="Prontuários sincronizados com os cadastros do backend." actions={<button className="primary-button page-primary" onClick={openCreate}><Plus size={18} /> Cadastrar paciente</button>} />
      {saved && <div className="success-toast"><span>✓</span><div><strong>Cadastro salvo</strong><small>Os dados já foram sincronizados com o servidor.</small></div><button onClick={() => setSaved(false)}><X size={16} /></button></div>}
      <div className="list-summary"><div><strong>{patients.data?.length ?? 0}</strong><span>Pacientes cadastrados</span></div><i /><div><strong>{patientsInTreatment}</strong><span>Em tratamento</span></div><i /><div><strong>{patientsWaiting}</strong><span>Aguardando vaga</span></div><i /><div><strong>{referrals.data?.filter((item) => item.statusEncaminhamento === 'ALTA').length ?? 0}</strong><span>Altas registradas</span></div></div>
      <section className="data-panel">
        <div className="table-toolbar"><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => updateSearch(event.target.value)} placeholder="Buscar por nome ou número SUS..." /></label></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Paciente</th><th>Número SUS</th><th>Contato</th><th>Entrada</th><th>Encaminhamentos</th><th>Situação</th><th /></tr></thead><tbody>{filtered.map((patient) => {
          const linked = (referrals.data ?? []).filter((item) => item.pacienteId === patient.id)
          const active = linked.find((item) => ['ASSUMIDO', 'EM_TRATAMENTO'].includes(item.statusEncaminhamento))
          const waiting = linked.find((item) => item.statusEncaminhamento === 'NA_FILA')
          const situation = active ? 'Em tratamento' : waiting ? 'Aguardando vaga' : linked.length ? 'Alta' : 'Sem encaminhamento'
          return <tr key={patient.id} onClick={() => setSelected(patient)}><td><div className="person-cell"><span className="patient-avatar large">{initials(patient.nome)}</span><div><strong>{patient.nome}</strong><small>{patient.endereco || 'Endereço não informado'}</small></div></div></td><td><span className="mono-text">{patient.numeroSus}</span></td><td>{patient.telefone || '—'}</td><td>{formatDate(patient.dataEntrada)}</td><td><span className="referral-count"><ClipboardPlus size={14} /> {linked.length}</span></td><td><StatusBadge>{situation}</StatusBadge></td><td><button className="table-more"><MoreHorizontal size={18} /></button></td></tr>
        })}</tbody></table>{!filtered.length && <div className="empty-state"><Search size={26} /><strong>Nenhum paciente encontrado</strong><p>Altere o termo de busca ou cadastre um novo paciente.</p></div>}</div>
        <footer className="table-footer"><span>Mostrando {filtered.length} de {patients.data?.length ?? 0} pacientes</span></footer>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Editar paciente' : 'Novo paciente'} description="Campos compatíveis com a entidade Paciente do Spring." size="large">
        <form onSubmit={submit}><div className="form-section"><div className="form-section-title"><span><UserRound size={18} /></span><div><strong>Dados do prontuário</strong><small>Nome e identificação SUS são obrigatórios</small></div></div><div className="form-grid">
          <label className="field field-wide"><span>Nome completo</span><input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></label>
          <label className="field"><span>Número SUS</span><input value={form.numeroSus} onChange={(event) => setForm({ ...form, numeroSus: event.target.value })} required /></label>
          <label className="field"><span>Data de nascimento</span><input type="date" value={form.dataNascimento ?? ''} onChange={(event) => setForm({ ...form, dataNascimento: event.target.value })} /></label>
          <label className="field"><span>Data de entrada</span><input type="date" value={form.dataEntrada ?? ''} onChange={(event) => setForm({ ...form, dataEntrada: event.target.value })} /></label>
          <label className="field"><span>Telefone</span><input value={form.telefone ?? ''} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></label>
          <label className="field field-wide"><span>Endereço</span><input value={form.endereco ?? ''} onChange={(event) => setForm({ ...form, endereco: event.target.value })} /></label>
        </div></div><MutationError error={saveMutation.error} /><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar prontuário'}</button></div></form>
      </Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.nome ?? ''} description={selected ? `Paciente #${String(selected.id).padStart(5, '0')}` : ''} size="large">
        {selected && <div className="patient-profile"><div className="profile-hero"><span className="profile-avatar">{initials(selected.nome)}</span><div><StatusBadge>{patientReferrals.some((item) => item.statusEncaminhamento === 'EM_TRATAMENTO') ? 'Em tratamento' : 'Cadastrado'}</StatusBadge><h3>{selected.nome}</h3><p>SUS {selected.numeroSus}</p></div><button className="secondary-button" onClick={() => openEdit(selected)}>Editar dados</button></div><div className="profile-info-grid"><div><span><CalendarDays size={15} /> Nascimento</span><strong>{formatDate(selected.dataNascimento)}</strong></div><div><span><Phone size={15} /> Telefone</span><strong>{selected.telefone || 'Não informado'}</strong></div><div><span><MapPin size={15} /> Endereço</span><strong>{selected.endereco || 'Não informado'}</strong></div><div><span><CalendarDays size={15} /> Entrada</span><strong>{formatDate(selected.dataEntrada)}</strong></div></div><div className="profile-section-heading"><div><span><ClipboardPlus size={17} /></span><div><strong>Jornada de cuidado</strong><small>Encaminhamentos vinculados</small></div></div></div>{patientReferrals.map((referral) => <article className="care-card" key={referral.id}><div className="care-card-top"><span className={`priority-pill priority-${prioridadeLabel[referral.prioridade].toLowerCase().replace('é', 'e')}`}>{prioridadeLabel[referral.prioridade]}</span><StatusBadge>{statusEncaminhamentoLabel[referral.statusEncaminhamento]}</StatusBadge></div><h4>{referral.patologia}</h4><p>{referral.medicoSolicitante} • {referral.tipoAtendimento}</p></article>)}{!patientReferrals.length && <div className="empty-care"><ClipboardPlus size={22} /><strong>Nenhum encaminhamento</strong><p>Este prontuário ainda não possui jornada de cuidado.</p></div>}</div>}
      </Modal>
    </section>
  )
}

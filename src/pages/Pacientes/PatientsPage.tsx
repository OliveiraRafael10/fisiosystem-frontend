import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardPlus, Filter, Mail, MapPin, MoreHorizontal, Phone, Plus, Search, UserRound, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { patients as initialPatients, referrals } from '../../data/mockData'
import type { Patient, PatientStatus } from '../../types'

const emptyForm = { name: '', cpf: '', birthDate: '', phone: '', city: '', status: 'Aguardando' as PatientStatus }

export function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<Patient[]>(initialPatients)
  const [query, setQuery] = useState(searchParams.get('busca') ?? '')
  const [status, setStatus] = useState('Todos')
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const externalQuery = searchParams.get('busca') ?? ''
    setQuery(externalQuery)
  }, [searchParams])

  useEffect(() => {
    const openForm = () => setFormOpen(true)
    window.addEventListener('fisio:new-patient', openForm)
    return () => window.removeEventListener('fisio:new-patient', openForm)
  }, [])

  const filtered = useMemo(() => items.filter((patient) => {
    const normalized = query.toLocaleLowerCase('pt-BR')
    const matchesQuery = patient.name.toLocaleLowerCase('pt-BR').includes(normalized) || patient.cpf.includes(query)
    const matchesStatus = status === 'Todos' || patient.status === status
    return matchesQuery && matchesStatus
  }), [items, query, status])

  function updateSearch(value: string) {
    setQuery(value)
    if (value) setSearchParams({ busca: value })
    else setSearchParams({})
  }

  function savePatient(event: FormEvent) {
    event.preventDefault()
    const initials = form.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    const patient: Patient = { ...form, id: Math.max(...items.map((item) => item.id)) + 1, initials, referrals: 0, lastVisit: 'Ainda sem consulta' }
    setItems((current) => [patient, ...current])
    setForm(emptyForm)
    setFormOpen(false)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 3500)
  }

  const patientReferrals = selected ? referrals.filter((item) => item.patientId === selected.id) : []

  return (
    <section className="page-content">
      <PageHeader eyebrow="ATENDIMENTO" title="Pacientes" description="Visualize prontuários, acompanhe tratamentos e mantenha os dados atualizados." actions={<button className="primary-button page-primary" onClick={() => setFormOpen(true)}><Plus size={18} /> Cadastrar paciente</button>} />
      {saved && <div className="success-toast"><span>✓</span><div><strong>Paciente cadastrado</strong><small>O prontuário já está disponível na lista.</small></div><button aria-label="Fechar" onClick={() => setSaved(false)}><X size={16} /></button></div>}
      <div className="list-summary">
        <div><strong>248</strong><span>Pacientes ativos</span></div><i /><div><strong>32</strong><span>Em tratamento</span></div><i /><div><strong>14</strong><span>Aguardando início</span></div><i /><div><strong>21</strong><span>Altas no mês</span></div>
      </div>
      <section className="data-panel">
        <div className="table-toolbar">
          <label className="table-search"><Search size={17} /><input value={query} onChange={(event) => updateSearch(event.target.value)} placeholder="Buscar por nome ou CPF..." /></label>
          <div className="filter-tabs">
            {['Todos', 'Em tratamento', 'Aguardando', 'Alta'].map((item) => <button className={status === item ? 'selected' : ''} onClick={() => setStatus(item)} key={item}>{item}</button>)}
          </div>
          <button className="secondary-button"><Filter size={16} /> Filtros</button>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Paciente</th><th>CPF</th><th>Contato</th><th>Último atendimento</th><th>Encaminhamentos</th><th>Status</th><th /></tr></thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id} onClick={() => setSelected(patient)}>
                  <td><div className="person-cell"><span className="patient-avatar large">{patient.initials}</span><div><strong>{patient.name}</strong><small>{patient.city}</small></div></div></td>
                  <td><span className="mono-text">{patient.cpf}</span></td>
                  <td><span>{patient.phone}</span></td>
                  <td><span>{patient.lastVisit}</span></td>
                  <td><span className="referral-count"><ClipboardPlus size={14} /> {patient.referrals}</span></td>
                  <td><StatusBadge>{patient.status}</StatusBadge></td>
                  <td><button className="table-more" aria-label={`Abrir ${patient.name}`}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><Search size={26} /><strong>Nenhum paciente encontrado</strong><p>Altere os filtros ou busque por outro termo.</p></div>}
        </div>
        <footer className="table-footer"><span>Mostrando {filtered.length} de {items.length} pacientes</span><div><button disabled><ChevronLeft size={16} /></button><button className="current">1</button><button>2</button><button>3</button><button><ChevronRight size={16} /></button></div></footer>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo paciente" description="Preencha os dados essenciais para criar o prontuário." size="large">
        <form onSubmit={savePatient}>
          <div className="form-section"><div className="form-section-title"><span><UserRound size={18} /></span><div><strong>Dados pessoais</strong><small>Identificação do paciente</small></div></div>
            <div className="form-grid"><label className="field field-wide"><span>Nome completo</span><input name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome e sobrenome" required /></label><label className="field"><span>CPF</span><input name="cpf" value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })} placeholder="000.000.000-00" required /></label><label className="field"><span>Data de nascimento</span><input type="date" name="birthDate" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} required /></label></div>
          </div>
          <div className="form-section"><div className="form-section-title"><span><Phone size={18} /></span><div><strong>Contato e localização</strong><small>Informações para comunicação</small></div></div>
            <div className="form-grid"><label className="field"><span>Telefone</span><input name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="(00) 00000-0000" required /></label><label className="field"><span>Cidade</span><input name="city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Cidade" required /></label><label className="field"><span>Status inicial</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PatientStatus })}><option>Aguardando</option><option>Em tratamento</option><option>Inativo</option></select></label></div>
          </div>
          <div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Criar prontuário</button></div>
        </form>
      </Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? ''} description={selected ? `Prontuário #${String(selected.id).padStart(5, '0')}` : ''} size="large">
        {selected && <div className="patient-profile">
          <div className="profile-hero"><span className="profile-avatar">{selected.initials}</span><div><StatusBadge>{selected.status}</StatusBadge><h3>{selected.name}</h3><p>{selected.cpf} • {selected.city}</p></div><button className="secondary-button">Editar dados</button></div>
          <div className="profile-info-grid"><div><span><CalendarDays size={15} /> Nascimento</span><strong>{new Date(`${selected.birthDate}T12:00:00`).toLocaleDateString('pt-BR')}</strong></div><div><span><Phone size={15} /> Telefone</span><strong>{selected.phone}</strong></div><div><span><MapPin size={15} /> Município</span><strong>{selected.city}</strong></div><div><span><Mail size={15} /> Última visita</span><strong>{selected.lastVisit}</strong></div></div>
          <div className="profile-section-heading"><div><span><ClipboardPlus size={17} /></span><div><strong>Jornada de cuidado</strong><small>Encaminhamentos e consultas vinculadas</small></div></div><button className="text-button">Novo encaminhamento <Plus size={15} /></button></div>
          {patientReferrals.length > 0 ? patientReferrals.map((referral) => <article className="care-card" key={referral.id}><div className="care-card-top"><span className={`priority-pill priority-${referral.priority.toLowerCase().replace('é', 'e')}`}>{referral.priority}</span><StatusBadge>{referral.status}</StatusBadge></div><h4>{referral.specialty}</h4><p>{referral.diagnosis} • Origem: {referral.origin}</p><div className="care-timeline"><i /><div><strong>Encaminhamento recebido</strong><span>{referral.requestedAt}</span></div><i className="future" /><div><strong>{referral.status === 'Concluído' ? 'Tratamento concluído' : 'Próxima etapa'}</strong><span>{referral.status === 'Aguardando vaga' ? 'Aguardando disponibilidade' : 'Consulta em 08 set, 09:20'}</span></div></div></article>) : <div className="empty-care"><ClipboardPlus size={22} /><strong>Nenhum encaminhamento ativo</strong><p>O paciente ainda não iniciou uma jornada de cuidado.</p></div>}
        </div>}
      </Modal>
    </section>
  )
}

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Building2, ClipboardCheck, Clock3, Filter, MoreHorizontal, Plus, Search, Siren } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { patients, referrals as initialReferrals } from '../../data/mockData'
import type { Priority, Referral } from '../../types'

const emptyReferral = { patientId: '', specialty: '', diagnosis: '', origin: '', priority: 'Média' as Priority }

export function ReferralsPage() {
  const [items, setItems] = useState(initialReferrals)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyReferral)

  const filtered = useMemo(() => items.filter((item) => {
    const term = query.toLocaleLowerCase('pt-BR')
    return (item.patient.toLocaleLowerCase('pt-BR').includes(term) || item.diagnosis.toLocaleLowerCase('pt-BR').includes(term) || String(item.id).includes(term)) && (status === 'Todos' || item.status === status)
  }), [items, query, status])

  function saveReferral(event: FormEvent) {
    event.preventDefault()
    const patient = patients.find((item) => item.id === Number(form.patientId))
    if (!patient) return
    const referral: Referral = { id: Math.max(...items.map((item) => item.id)) + 1, patientId: patient.id, patient: patient.name, specialty: form.specialty, diagnosis: form.diagnosis, origin: form.origin, priority: form.priority, status: 'Aguardando vaga', requestedAt: '01 set 2026', waitDays: 0 }
    setItems((current) => [referral, ...current])
    setForm(emptyReferral)
    setFormOpen(false)
  }

  return (
    <section className="page-content">
      <PageHeader eyebrow="REGULAÇÃO" title="Encaminhamentos" description="Priorize demandas, acompanhe a fila e conecte cada paciente ao cuidado adequado." actions={<button className="primary-button page-primary" onClick={() => setFormOpen(true)}><Plus size={18} /> Novo encaminhamento</button>} />
      <div className="metric-row">
        <article><span className="metric-icon peach"><Clock3 /></span><div><strong>12</strong><p>Aguardando vaga</p></div><em>+2 esta semana</em></article>
        <article><span className="metric-icon red"><Siren /></span><div><strong>3</strong><p>Prioridade alta</p></div><em>Requer atenção</em></article>
        <article><span className="metric-icon mint"><ClipboardCheck /></span><div><strong>36</strong><p>Em tratamento</p></div><em>74% da capacidade</em></article>
        <article><span className="metric-icon blue"><Building2 /></span><div><strong>9</strong><p>Unidades solicitantes</p></div><em>Este mês</em></article>
      </div>
      <section className="data-panel">
        <div className="table-toolbar">
          <label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar paciente, diagnóstico ou protocolo..." /></label>
          <div className="filter-tabs">{['Todos', 'Aguardando vaga', 'Em tratamento', 'Concluído'].map((item) => <button className={status === item ? 'selected' : ''} onClick={() => setStatus(item)} key={item}>{item}</button>)}</div>
          <button className="secondary-button"><Filter size={16} /> Prioridade</button>
        </div>
        <div className="table-scroll"><table className="data-table referral-table"><thead><tr><th>Protocolo</th><th>Paciente</th><th>Especialidade</th><th>Origem</th><th>Prioridade</th><th>Espera</th><th>Status</th><th /></tr></thead><tbody>
          {filtered.map((referral) => <tr key={referral.id}><td><span className="protocol">#{referral.id}</span></td><td><div className="person-cell compact"><span className="patient-avatar">{referral.patient.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{referral.patient}</strong><small>{referral.diagnosis}</small></div></div></td><td><span>{referral.specialty}</span></td><td><span>{referral.origin}</span></td><td><span className={`priority-pill priority-${referral.priority.toLowerCase().replace('é', 'e')}`}>{referral.priority}</span></td><td><span className={referral.waitDays >= 8 ? 'wait-danger' : ''}>{referral.waitDays ? `${referral.waitDays} dias` : '—'}</span></td><td><StatusBadge>{referral.status}</StatusBadge></td><td><button className="table-more"><MoreHorizontal size={18} /></button></td></tr>)}
        </tbody></table></div>
        <footer className="table-footer"><span>{filtered.length} encaminhamentos encontrados</span><button className="text-button">Exportar lista <ArrowUpRight size={14} /></button></footer>
      </section>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo encaminhamento" description="Vincule a solicitação a um paciente e defina a prioridade clínica." size="large">
        <form onSubmit={saveReferral}><div className="form-section"><div className="form-section-title"><span><ClipboardCheck size={18} /></span><div><strong>Solicitação clínica</strong><small>Dados do encaminhamento</small></div></div><div className="form-grid"><label className="field field-wide"><span>Paciente</span><select value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} required><option value="">Selecione um paciente</option>{patients.map((patient) => <option value={patient.id} key={patient.id}>{patient.name} • {patient.cpf}</option>)}</select></label><label className="field"><span>Especialidade</span><select value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} required><option value="">Selecionar</option><option>Ortopedia</option><option>Neurologia</option><option>Geriatria</option><option>Respiratória</option></select></label><label className="field"><span>Prioridade</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}><option>Alta</option><option>Média</option><option>Baixa</option></select></label><label className="field"><span>Unidade de origem</span><input value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} placeholder="UBS ou hospital solicitante" required /></label><label className="field field-wide"><span>Diagnóstico ou indicação</span><textarea value={form.diagnosis} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} placeholder="Descreva a indicação clínica" required /></label></div></div><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" type="submit">Registrar encaminhamento</button></div></form>
      </Modal>
    </section>
  )
}

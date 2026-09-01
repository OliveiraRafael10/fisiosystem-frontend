import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, Building2, ClipboardCheck, Clock3, MoreHorizontal, Plus, Search, Siren } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { daysWaiting, formatDate, initials, localDate, prioridadeLabel, statusEncaminhamentoLabel } from '../../lib/domain'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'
import { therapistService } from '../../services/therapistService'
import type { Encaminhamento, EncaminhamentoInput, Prioridade, StatusEncaminhamento, TipoAtendimento } from '../../types'

const emptyReferral: EncaminhamentoInput = { dataEntrega: localDate(), paciente: { id: 0 }, medicoSolicitante: '', tipoAtendimento: 'SUS', statusEncaminhamento: 'NA_FILA', prioridade: 'SECUNDARIA', patologia: '', observacoes: '' }

export function ReferralsPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'TODOS' | StatusEncaminhamento>('TODOS')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<EncaminhamentoInput>(emptyReferral)
  const [selected, setSelected] = useState<Encaminhamento | null>(null)
  const [therapistId, setTherapistId] = useState(0)
  const [reason, setReason] = useState('')
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const indicators = useQuery({ queryKey: ['referrals', 'indicators'], queryFn: referralService.indicators })
  const priority = useQuery({ queryKey: ['referrals', 'queue-priority'], queryFn: referralService.queuePriorityIndicators })
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['referrals'] })
    void queryClient.invalidateQueries({ queryKey: ['appointments'] })
  }
  const createMutation = useMutation({ mutationFn: () => referralService.create(form), onSuccess: () => { invalidate(); setFormOpen(false); setForm(emptyReferral) } })
  const actionMutation = useMutation({
    mutationFn: async (action: 'assume' | 'withdraw' | 'discharge') => {
      if (!selected) throw new Error('Selecione um encaminhamento.')
      if (action === 'assume') return referralService.assume(selected.id, therapistId)
      if (action === 'withdraw') return referralService.withdraw(selected.id, reason)
      return referralService.discharge(selected.id)
    },
    onSuccess: () => { invalidate(); setSelected(null); setTherapistId(0); setReason('') },
  })

  const filtered = useMemo(() => (referrals.data ?? []).filter((item) => {
    const term = query.toLocaleLowerCase('pt-BR')
    const matches = item.pacienteNome.toLocaleLowerCase('pt-BR').includes(term) || item.patologia.toLocaleLowerCase('pt-BR').includes(term) || String(item.id).includes(term)
    return matches && (status === 'TODOS' || item.statusEncaminhamento === status)
  }), [referrals.data, query, status])

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  const queries = [referrals, indicators, priority, patients, therapists]
  const errorQuery = queries.find((item) => item.isError)
  if (queries.some((item) => item.isLoading)) return <section className="page-content"><ApiLoading label="Organizando a fila clínica..." /></section>
  if (errorQuery) return <section className="page-content"><ApiError error={errorQuery.error} retry={() => queries.forEach((item) => void item.refetch())} /></section>

  return (
    <section className="page-content">
      <PageHeader eyebrow="REGULAÇÃO" title="Encaminhamentos" description="Fila, prioridades e transições controladas pelas regras do Spring." actions={<button className="primary-button page-primary" onClick={() => { createMutation.reset(); setFormOpen(true) }}><Plus size={18} /> Novo encaminhamento</button>} />
      <div className="metric-row">
        <article><span className="metric-icon peach"><Clock3 /></span><div><strong>{indicators.data?.naFila ?? 0}</strong><p>Aguardando vaga</p></div><em>Fila atual</em></article>
        <article><span className="metric-icon red"><Siren /></span><div><strong>{priority.data?.primaria ?? 0}</strong><p>Prioridade alta</p></div><em>Requer atenção</em></article>
        <article><span className="metric-icon mint"><ClipboardCheck /></span><div><strong>{indicators.data?.emTratamento ?? 0}</strong><p>Em tratamento</p></div><em>{indicators.data?.assumidos ?? 0} assumidos</em></article>
        <article><span className="metric-icon blue"><Building2 /></span><div><strong>{indicators.data?.altas ?? 0}</strong><p>Altas registradas</p></div><em>{indicators.data?.total ?? 0} no total</em></article>
      </div>
      <section className="data-panel">
        <div className="table-toolbar"><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar paciente, patologia ou protocolo..." /></label><div className="filter-tabs">{([['TODOS', 'Todos'], ['NA_FILA', 'Na fila'], ['ASSUMIDO', 'Assumidos'], ['EM_TRATAMENTO', 'Em tratamento'], ['ALTA', 'Alta']] as const).map(([value, label]) => <button className={status === value ? 'selected' : ''} onClick={() => setStatus(value)} key={value}>{label}</button>)}</div></div>
        <div className="table-scroll"><table className="data-table referral-table"><thead><tr><th>Protocolo</th><th>Paciente</th><th>Patologia</th><th>Médico</th><th>Prioridade</th><th>Espera</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((referral) => <tr key={referral.id}><td><span className="protocol">#{referral.id}</span></td><td><div className="person-cell compact"><span className="patient-avatar">{initials(referral.pacienteNome)}</span><div><strong>{referral.pacienteNome}</strong><small>{referral.tipoAtendimento}</small></div></div></td><td>{referral.patologia}</td><td>{referral.medicoSolicitante}</td><td><span className={`priority-pill priority-${prioridadeLabel[referral.prioridade].toLowerCase().replace('é', 'e')}`}>{prioridadeLabel[referral.prioridade]}</span></td><td><span className={daysWaiting(referral.dataEntrega) >= 8 ? 'wait-danger' : ''}>{referral.statusEncaminhamento === 'NA_FILA' ? `${daysWaiting(referral.dataEntrega)} dias` : '—'}</span></td><td><StatusBadge>{statusEncaminhamentoLabel[referral.statusEncaminhamento]}</StatusBadge></td><td><button className="table-more" onClick={() => { actionMutation.reset(); setSelected(referral) }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><ClipboardCheck size={25} /><strong>Nenhum encaminhamento encontrado</strong><p>A fila não possui registros para estes filtros.</p></div>}</div>
        <footer className="table-footer"><span>{filtered.length} encaminhamentos encontrados</span><button className="text-button">Dados atualizados <ArrowUpRight size={14} /></button></footer>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo encaminhamento" description="Cadastre exatamente os dados esperados pelo backend." size="large"><form onSubmit={submit}><div className="form-section"><div className="form-section-title"><span><ClipboardCheck size={18} /></span><div><strong>Solicitação clínica</strong><small>O novo registro entrará automaticamente na fila</small></div></div><div className="form-grid">
        <label className="field field-wide"><span>Paciente</span><select value={form.paciente.id} onChange={(event) => setForm({ ...form, paciente: { id: Number(event.target.value) } })} required><option value={0}>Selecione um paciente</option>{patients.data?.map((patient) => <option value={patient.id} key={patient.id}>{patient.nome} • SUS {patient.numeroSus}</option>)}</select></label>
        <label className="field"><span>Data de entrega</span><input type="date" value={form.dataEntrega} onChange={(event) => setForm({ ...form, dataEntrega: event.target.value })} required /></label>
        <label className="field"><span>Tipo de atendimento</span><select value={form.tipoAtendimento} onChange={(event) => setForm({ ...form, tipoAtendimento: event.target.value as TipoAtendimento })}><option value="SUS">SUS</option><option value="CONVENIO">Convênio</option></select></label>
        <label className="field"><span>Prioridade</span><select value={form.prioridade} onChange={(event) => setForm({ ...form, prioridade: event.target.value as Prioridade })}><option value="PRIMARIA">Primária • alta</option><option value="SECUNDARIA">Secundária • média</option><option value="TERCIARIA">Terciária • baixa</option></select></label>
        <label className="field"><span>Médico solicitante</span><input value={form.medicoSolicitante} onChange={(event) => setForm({ ...form, medicoSolicitante: event.target.value })} required /></label>
        <label className="field field-wide"><span>Patologia</span><input value={form.patologia} onChange={(event) => setForm({ ...form, patologia: event.target.value })} required /></label>
        <label className="field field-wide"><span>Observações</span><textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} /></label>
      </div></div><MutationError error={createMutation.error} /><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" disabled={createMutation.isPending || !form.paciente.id}>{createMutation.isPending ? 'Registrando...' : 'Registrar encaminhamento'}</button></div></form></Modal>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Encaminhamento #${selected.id}` : ''} description={selected ? `${selected.pacienteNome} • recebido em ${formatDate(selected.dataEntrega)}` : ''} size="large">{selected && <div className="patient-profile"><div className="profile-hero"><span className="profile-avatar">{initials(selected.pacienteNome)}</span><div><StatusBadge>{statusEncaminhamentoLabel[selected.statusEncaminhamento]}</StatusBadge><h3>{selected.patologia}</h3><p>{prioridadeLabel[selected.prioridade]} prioridade • {selected.tipoAtendimento}</p></div></div><div className="profile-info-grid"><div><span>Médico solicitante</span><strong>{selected.medicoSolicitante}</strong></div><div><span>Responsável</span><strong>{selected.fisioterapeutaResponsavelNome || 'Não atribuído'}</strong></div><div><span>Assunção</span><strong>{formatDate(selected.dataAssuncao)}</strong></div><div><span>Alta</span><strong>{formatDate(selected.dataAlta)}</strong></div></div>
        {selected.statusEncaminhamento === 'NA_FILA' && <div className="form-section"><label className="field"><span>Fisioterapeuta que assumirá o caso</span><select value={therapistId} onChange={(event) => setTherapistId(Number(event.target.value))}><option value={0}>Selecione</option>{therapists.data?.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome} • {item.crefito}</option>)}</select></label><button className="primary-button" disabled={!therapistId || actionMutation.isPending} onClick={() => actionMutation.mutate('assume')}>Assumir encaminhamento</button></div>}
        {selected.statusEncaminhamento === 'EM_TRATAMENTO' && <button className="primary-button" disabled={actionMutation.isPending} onClick={() => actionMutation.mutate('discharge')}>Registrar alta terapêutica</button>}
        {!['ALTA', 'RETIRADO_PELO_PACIENTE'].includes(selected.statusEncaminhamento) && <div className="form-section"><label className="field field-wide"><span>Motivo da retirada</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Preencha somente para retirada pelo paciente" /></label><button className="secondary-button" disabled={!reason.trim() || actionMutation.isPending} onClick={() => actionMutation.mutate('withdraw')}>Registrar retirada</button></div>}
        <MutationError error={actionMutation.error} />
      </div>}</Modal>
    </section>
  )
}

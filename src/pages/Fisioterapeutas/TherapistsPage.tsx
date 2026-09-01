import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, MoreHorizontal, Phone, Plus, Search, UsersRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { initials } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import { therapistService } from '../../services/therapistService'
import type { Fisioterapeuta } from '../../types'

const emptyForm = { nome: '', crefito: '', telefone: '' }

export function TherapistsPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [selected, setSelected] = useState<Fisioterapeuta | null>(null)
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: appointmentService.list })
  const createMutation = useMutation({ mutationFn: () => therapistService.create(form), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['therapists'] }); setFormOpen(false); setForm(emptyForm) } })
  const toggleMutation = useMutation({
    mutationFn: (therapist: Fisioterapeuta) => therapist.ativo ? therapistService.deactivate(therapist.id) : therapistService.activate(therapist.id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['therapists'] }); setSelected(null) },
  })
  const filtered = useMemo(() => (therapists.data ?? []).filter((item) => {
    const matchesQuery = item.nome.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')) || (item.crefito ?? '').toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
    return matchesQuery && (filter === 'todos' || (filter === 'ativos' ? item.ativo : !item.ativo))
  }), [therapists.data, query, filter])

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  if (therapists.isLoading || appointments.isLoading) return <section className="page-content"><ApiLoading label="Carregando a equipe clínica..." /></section>
  if (therapists.isError || appointments.isError) return <section className="page-content"><ApiError error={therapists.error ?? appointments.error} retry={() => { void therapists.refetch(); void appointments.refetch() }} /></section>

  const activeCount = therapists.data?.filter((item) => item.ativo).length ?? 0
  return (
    <section className="page-content">
      <PageHeader eyebrow="EQUIPE CLÍNICA" title="Fisioterapeutas" description="Profissionais, CREFITO e situação funcional vindos da API." actions={<button className="primary-button page-primary" onClick={() => { createMutation.reset(); setFormOpen(true) }}><Plus size={18} /> Novo profissional</button>} />
      <div className="team-summary"><div><span className="summary-icon"><UsersRound /></span><div><strong>{therapists.data?.length ?? 0} profissionais</strong><p>{activeCount} ativos</p></div></div><div className="team-capacity"><span>Equipe ativa</span><div><i style={{ width: `${therapists.data?.length ? activeCount / therapists.data.length * 100 : 0}%` }} /></div><strong>{therapists.data?.length ? Math.round(activeCount / therapists.data.length * 100) : 0}%</strong></div></div>
      <div className="team-toolbar"><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar profissional ou CREFITO..." /></label><div className="filter-tabs"><button className={filter === 'todos' ? 'selected' : ''} onClick={() => setFilter('todos')}>Todos</button><button className={filter === 'ativos' ? 'selected' : ''} onClick={() => setFilter('ativos')}>Ativos</button><button className={filter === 'inativos' ? 'selected' : ''} onClick={() => setFilter('inativos')}>Inativos</button></div></div>
      <div className="therapist-grid">{filtered.map((therapist, index) => {
        const count = appointments.data?.filter((item) => item.fisioterapeutaId === therapist.id).length ?? 0
        const colors = ['mint', 'blue', 'violet', 'peach']
        const color = colors[index % colors.length]
        return <article className="therapist-card" key={therapist.id}><div className={`therapist-cover cover-${color}`}><span className={`therapist-avatar avatar-${color}`}>{initials(therapist.nome)}</span><button onClick={() => { toggleMutation.reset(); setSelected(therapist) }}><MoreHorizontal size={19} /></button></div><div className="therapist-body"><div className="therapist-name"><div><h2>{therapist.nome}</h2><p>{therapist.crefito || 'CREFITO não informado'}</p></div><StatusBadge>{therapist.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></div><span className="specialty-label">Fisioterapia</span><div className="contact-lines"><span><Phone size={14} /> {therapist.telefone || 'Telefone não informado'}</span></div><footer><span><CalendarCheck size={16} /><strong>{count}</strong> consultas registradas</span><button onClick={() => setSelected(therapist)}>Gerenciar</button></footer></div></article>
      })}<button className="add-therapist-card" onClick={() => setFormOpen(true)}><span><Plus size={23} /></span><strong>Adicionar fisioterapeuta</strong><p>Cadastre um novo profissional na equipe.</p></button></div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo fisioterapeuta" description="O profissional será cadastrado como ativo." size="large"><form onSubmit={submit}><div className="form-section"><div className="form-grid"><label className="field field-wide"><span>Nome completo</span><input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></label><label className="field"><span>CREFITO</span><input value={form.crefito} onChange={(event) => setForm({ ...form, crefito: event.target.value })} /></label><label className="field"><span>Telefone</span><input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></label></div></div><MutationError error={createMutation.error} /><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancelar</button><button className="primary-button" disabled={createMutation.isPending}>{createMutation.isPending ? 'Salvando...' : 'Cadastrar profissional'}</button></div></form></Modal>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.nome ?? ''} description={selected?.crefito || 'Profissional sem CREFITO informado'}>{selected && <div className="form-section"><StatusBadge>{selected.ativo ? 'Ativo' : 'Inativo'}</StatusBadge><p>{selected.telefone || 'Telefone não informado'}</p><MutationError error={toggleMutation.error} /><div className="modal-footer"><button className={selected.ativo ? 'secondary-button' : 'primary-button'} disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate(selected)}>{toggleMutation.isPending ? 'Atualizando...' : selected.ativo ? 'Inativar profissional' : 'Ativar profissional'}</button></div></div>}</Modal>
    </section>
  )
}

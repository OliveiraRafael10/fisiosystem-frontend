import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { localDate } from '../../lib/domain'
import { patientService } from '../../services/patientService'
import type { PacienteInput } from '../../types'

const emptyForm: PacienteInput = { nome: '', numeroSus: '', dataNascimento: '', dataEntrada: localDate(), telefone: '', endereco: '' }

export function PatientFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { patientId } = useParams()
  const editingId = patientId ? Number(patientId) : null
  const [form, setForm] = useState<PacienteInput>(emptyForm)
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list, enabled: Boolean(editingId) })
  const editing = patients.data?.find((item) => item.id === editingId)

  useEffect(() => {
    if (!editing) return
    setForm({ numeroSus: editing.numeroSus, nome: editing.nome, dataNascimento: editing.dataNascimento ?? '', dataEntrada: editing.dataEntrada ?? localDate(), telefone: editing.telefone ?? '', endereco: editing.endereco ?? '' })
  }, [editing])

  const saveMutation = useMutation({
    mutationFn: () => editingId ? patientService.update(editingId, form) : patientService.create(form),
    onSuccess: (patient) => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] })
      navigate(`/pacientes/${patient.id}`, { replace: true, state: { from: '/pacientes' } })
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    saveMutation.mutate()
  }

  if (editingId && patients.isLoading) return <section className="page-content"><ApiLoading label="Carregando prontuário..." /></section>
  if (editingId && patients.isError) return <section className="page-content"><ApiError error={patients.error} retry={() => void patients.refetch()} /></section>
  if (editingId && !editing) return <section className="page-content"><ApiError error={new Error('Paciente não encontrado.')} retry={() => navigate('/pacientes')} /></section>

  return (
    <SubpageShell eyebrow="PRONTUÁRIO" title={editing ? 'Editar paciente' : 'Novo paciente'} description={editing ? `Atualize os dados de ${editing.nome}.` : 'Cadastre os dados pessoais e de atendimento do paciente.'} fallback={editing ? `/pacientes/${editing.id}` : '/pacientes'} backLabel={editing ? 'o prontuário' : 'pacientes'}>
      <form className="subpage-form" onSubmit={submit}>
        <div className="form-section">
          <div className="form-section-title"><span><UserRound size={20} /></span><div><strong>Dados do prontuário</strong><small>Nome e identificação SUS são obrigatórios</small></div></div>
          <div className="form-grid">
            <label className="field field-wide"><span>Nome completo</span><input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></label>
            <label className="field"><span>Número SUS</span><input value={form.numeroSus} onChange={(event) => setForm({ ...form, numeroSus: event.target.value })} required /></label>
            <label className="field"><span>Data de nascimento</span><input type="date" value={form.dataNascimento ?? ''} onChange={(event) => setForm({ ...form, dataNascimento: event.target.value })} /></label>
            <label className="field"><span>Data de entrada</span><input type="date" value={form.dataEntrada ?? ''} onChange={(event) => setForm({ ...form, dataEntrada: event.target.value })} /></label>
            <label className="field"><span>Telefone</span><input value={form.telefone ?? ''} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></label>
            <label className="field field-wide"><span>Endereço</span><input value={form.endereco ?? ''} onChange={(event) => setForm({ ...form, endereco: event.target.value })} /></label>
          </div>
        </div>
        <MutationError error={saveMutation.error} />
        <div className="subpage-action-bar"><button type="button" className="secondary-button" onClick={() => navigate(editing ? `/pacientes/${editing.id}` : '/pacientes')}>Cancelar</button><button className="primary-button" disabled={saveMutation.isPending}><Save size={18} /> {saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar prontuário'}</button></div>
      </form>
    </SubpageShell>
  )
}

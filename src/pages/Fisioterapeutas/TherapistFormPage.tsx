import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, UserRoundPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { MutationError } from '../../components/ui/ApiState'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { therapistService } from '../../services/therapistService'

const emptyForm = { nome: '', crefito: '', telefone: '' }

export function TherapistFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const createMutation = useMutation({
    mutationFn: () => therapistService.create(form),
    onSuccess: (therapist) => {
      void queryClient.invalidateQueries({ queryKey: ['therapists'] })
      navigate(`/fisioterapeutas/${therapist.id}`, { replace: true, state: { from: '/fisioterapeutas' } })
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  return (
    <SubpageShell eyebrow="EQUIPE CLÍNICA" title="Novo fisioterapeuta" description="Cadastre um profissional que iniciará com situação ativa." fallback="/fisioterapeutas" backLabel="fisioterapeutas">
      <form className="subpage-form" onSubmit={submit}>
        <div className="form-section"><div className="form-section-title"><span><UserRoundPlus size={20} /></span><div><strong>Dados profissionais</strong><small>Identificação e contato da equipe clínica</small></div></div><div className="form-grid"><label className="field field-wide"><span>Nome completo</span><input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></label><label className="field"><span>CREFITO</span><input value={form.crefito} onChange={(event) => setForm({ ...form, crefito: event.target.value })} /></label><label className="field"><span>Telefone</span><input value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} /></label></div></div>
        <MutationError error={createMutation.error} />
        <div className="subpage-action-bar"><button type="button" className="secondary-button" onClick={() => navigate('/fisioterapeutas')}>Cancelar</button><button className="primary-button" disabled={createMutation.isPending}><Save size={18} /> {createMutation.isPending ? 'Salvando...' : 'Cadastrar profissional'}</button></div>
      </form>
    </SubpageShell>
  )
}

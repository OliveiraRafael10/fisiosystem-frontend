import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { localDate } from '../../lib/domain'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'
import type { EncaminhamentoInput, Prioridade, TipoAtendimento } from '../../types'

const emptyReferral: EncaminhamentoInput = {
  dataEntrega: localDate(),
  paciente: { id: 0 },
  medicoSolicitante: '',
  tipoAtendimento: 'SUS',
  statusEncaminhamento: 'NA_FILA',
  prioridade: 'SECUNDARIA',
  patologia: '',
  observacoes: '',
}

export function ReferralFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<EncaminhamentoInput>(emptyReferral)
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const createMutation = useMutation({
    mutationFn: () => referralService.create(form),
    onSuccess: (referral) => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      navigate(`/encaminhamentos/${referral.id}`, {
        replace: true,
        state: { from: '/encaminhamentos' },
      })
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  if (patients.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Preparando novo encaminhamento..." />
      </section>
    )
  if (patients.isError)
    return (
      <section className="page-content">
        <ApiError error={patients.error} retry={() => void patients.refetch()} />
      </section>
    )

  return (
    <SubpageShell
      eyebrow="REGULAÇÃO"
      title="Novo encaminhamento"
      description="Cadastre a solicitação clínica que entrará automaticamente na fila."
      fallback="/encaminhamentos"
      backLabel="encaminhamentos"
    >
      <form className="subpage-form" onSubmit={submit}>
        <div className="form-section">
          <div className="form-section-title">
            <span>
              <ClipboardCheck size={20} />
            </span>
            <div>
              <strong>Solicitação clínica</strong>
              <small>Preencha os dados do paciente e da indicação médica</small>
            </div>
          </div>
          <div className="form-grid">
            <label className="field field-wide">
              <span>Paciente</span>
              <select
                value={form.paciente.id}
                onChange={(event) =>
                  setForm({ ...form, paciente: { id: Number(event.target.value) } })
                }
                required
              >
                <option value={0}>Selecione um paciente</option>
                {patients.data?.map((patient) => (
                  <option value={patient.id} key={patient.id}>
                    {patient.nome} • SUS {patient.numeroSus}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Data de entrega</span>
              <input
                type="date"
                value={form.dataEntrega}
                onChange={(event) => setForm({ ...form, dataEntrega: event.target.value })}
                required
              />
            </label>
            <label className="field">
              <span>Tipo de atendimento</span>
              <select
                value={form.tipoAtendimento}
                onChange={(event) =>
                  setForm({ ...form, tipoAtendimento: event.target.value as TipoAtendimento })
                }
              >
                <option value="SUS">SUS</option>
                <option value="CONVENIO">Convênio</option>
              </select>
            </label>
            <label className="field">
              <span>Prioridade</span>
              <select
                value={form.prioridade}
                onChange={(event) =>
                  setForm({ ...form, prioridade: event.target.value as Prioridade })
                }
              >
                <option value="PRIMARIA">Primária • alta</option>
                <option value="SECUNDARIA">Secundária • média</option>
                <option value="TERCIARIA">Terciária • baixa</option>
              </select>
            </label>
            <label className="field">
              <span>Médico solicitante</span>
              <input
                value={form.medicoSolicitante}
                onChange={(event) => setForm({ ...form, medicoSolicitante: event.target.value })}
                required
              />
            </label>
            <label className="field field-wide">
              <span>Patologia</span>
              <input
                value={form.patologia}
                onChange={(event) => setForm({ ...form, patologia: event.target.value })}
                required
              />
            </label>
            <label className="field field-wide">
              <span>Observações</span>
              <textarea
                value={form.observacoes}
                onChange={(event) => setForm({ ...form, observacoes: event.target.value })}
              />
            </label>
          </div>
        </div>
        <MutationError error={createMutation.error} />
        <div className="subpage-action-bar">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/encaminhamentos')}
          >
            Cancelar
          </button>
          <button
            className="primary-button"
            disabled={createMutation.isPending || !form.paciente.id}
          >
            <Save size={18} />{' '}
            {createMutation.isPending ? 'Registrando...' : 'Registrar encaminhamento'}
          </button>
        </div>
      </form>
    </SubpageShell>
  )
}

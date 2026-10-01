import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, Save, UserRound, UserRoundPlus } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/EstadoApi'
import { ModalAcaoConcluida } from '../../components/ui/ModalAcaoConcluida'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { dataLocal } from '../../lib/dominio'
import { servicoPaciente } from '../../services/servicoPaciente'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import type { Encaminhamento, EncaminhamentoInput, Prioridade, TipoAtendimento } from '../../types/modelos'

const emptyReferral: EncaminhamentoInput = {
  dataEntrega: dataLocal(),
  paciente: { id: 0 },
  medicoSolicitante: '',
  tipoAtendimento: 'SUS',
  statusEncaminhamento: 'NA_FILA',
  prioridade: 'SECUNDARIA',
  patologia: '',
  observacoes: '',
}

interface ReferralFormLocationState {
  createdPatientId?: number
  referralDraft?: EncaminhamentoInput
}

const patientNameCollator = new Intl.Collator('pt-BR', { sensitivity: 'base' })

export function FormularioEncaminhamento() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const locationState = location.state as ReferralFormLocationState | null
  const [form, setForm] = useState<EncaminhamentoInput>(() => {
    const draft = locationState?.referralDraft ?? emptyReferral

    return locationState?.createdPatientId
      ? { ...draft, paciente: { id: locationState.createdPatientId } }
      : draft
  })
  const [createdReferral, setCreatedReferral] = useState<Encaminhamento | null>(null)
  const patients = useQuery({ queryKey: ['patients'], queryFn: servicoPaciente.listar })
  const sortedPatients = useMemo(
    () =>
      [...(patients.data ?? [])].sort((first, second) =>
        patientNameCollator.compare(first.nome, second.nome),
      ),
    [patients.data],
  )
  const createMutation = useMutation({
    mutationFn: () => servicoEncaminhamento.criar(form),
    onSuccess: (referral) => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setCreatedReferral(referral)
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  function startPatientRegistration() {
    navigate('/pacientes/novo', {
      state: {
        from: '/encaminhamentos/novo',
        referralDraft: form,
        returnWithPatient: true,
      },
    })
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
    <>
      <EstruturaSubpagina
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
              <div className="field field-wide">
                <span>Paciente</span>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 max-[680px]:grid-cols-1">
                  <select
                    aria-label="Paciente"
                    value={form.paciente.id}
                    onChange={(event) =>
                      setForm({ ...form, paciente: { id: Number(event.target.value) } })
                    }
                    required
                  >
                    <option value={0}>Selecione um paciente</option>
                    {sortedPatients.map((patient) => (
                      <option value={patient.id} key={patient.id}>
                        {patient.nome} • SUS {patient.numeroSus}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="secondary-button min-h-13.5 whitespace-nowrap px-5"
                    onClick={startPatientRegistration}
                  >
                    <UserRoundPlus size={19} /> Novo paciente
                  </button>
                </div>
              </div>
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
      </EstruturaSubpagina>
      <ModalAcaoConcluida
        open={Boolean(createdReferral)}
        title="Encaminhamento cadastrado com sucesso"
        description="A solicitação clínica foi confirmada pelo sistema."
        message="O encaminhamento já está disponível na fila conforme sua prioridade."
        actionLabel="Voltar para encaminhamentos"
        onClose={() => navigate('/encaminhamentos', { replace: true })}
        details={
          createdReferral
            ? [
                {
                  icon: ClipboardCheck,
                  label: 'Encaminhamento',
                  value: `#${createdReferral.id}`,
                },
                {
                  icon: UserRound,
                  label: 'Paciente',
                  tone: 'blue',
                  value: createdReferral.pacienteNome || 'Não informado',
                },
              ]
            : []
        }
      />
    </>
  )
}

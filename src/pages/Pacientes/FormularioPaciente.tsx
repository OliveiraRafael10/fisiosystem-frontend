import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IdCard, Save, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/EstadoApi'
import { ModalAcaoConcluida } from '../../components/ui/ModalAcaoConcluida'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { dataLocal } from '../../lib/dominio'
import { servicoPaciente } from '../../services/servicoPaciente'
import type { EncaminhamentoInput, Paciente, PacienteInput } from '../../types/modelos'

const emptyForm: PacienteInput = {
  nome: '',
  numeroSus: '',
  dataNascimento: '',
  dataEntrada: dataLocal(),
  telefone: '',
  endereco: '',
}

interface PatientFormLocationState {
  from?: string
  referralDraft?: EncaminhamentoInput
  returnWithPatient?: boolean
}

export function FormularioPaciente() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { patientId } = useParams()
  const editingId = patientId ? Number(patientId) : null
  const locationState = location.state as PatientFormLocationState | null
  const returnToReferral =
    !editingId &&
    locationState?.returnWithPatient === true &&
    locationState.from === '/encaminhamentos/novo'
  const [form, setForm] = useState<PacienteInput>(emptyForm)
  const [savedPatient, setSavedPatient] = useState<Paciente | null>(null)
  const patients = useQuery({
    queryKey: ['patients'],
    queryFn: servicoPaciente.listar,
    enabled: Boolean(editingId),
  })
  const editing = patients.data?.find((item) => item.id === editingId)

  useEffect(() => {
    if (!editing) return
    setForm({
      numeroSus: editing.numeroSus,
      nome: editing.nome,
      dataNascimento: editing.dataNascimento ?? '',
      dataEntrada: editing.dataEntrada ?? dataLocal(),
      telefone: editing.telefone ?? '',
      endereco: editing.endereco ?? '',
    })
  }, [editing])

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId ? servicoPaciente.atualizar(editingId, form) : servicoPaciente.criar(form),
    onSuccess: (patient) => {
      void queryClient.invalidateQueries({ queryKey: ['patients'] })
      setSavedPatient(patient)
    },
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    saveMutation.mutate()
  }

  function closeSuccess() {
    if (!savedPatient) return

    if (returnToReferral) {
      navigate('/encaminhamentos/novo', {
        replace: true,
        state: {
          createdPatientId: savedPatient.id,
          referralDraft: locationState?.referralDraft,
        },
      })
      return
    }

    navigate(editingId ? `/pacientes/${savedPatient.id}` : '/pacientes', {
      replace: true,
      state: { from: '/pacientes' },
    })
  }

  if (editingId && patients.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando prontuário..." />
      </section>
    )
  if (editingId && patients.isError)
    return (
      <section className="page-content">
        <ApiError error={patients.error} retry={() => void patients.refetch()} />
      </section>
    )
  if (editingId && !editing)
    return (
      <section className="page-content">
        <ApiError
          error={new Error('Paciente não encontrado.')}
          retry={() => navigate('/pacientes')}
        />
      </section>
    )

  return (
    <>
      <EstruturaSubpagina
        eyebrow="PRONTUÁRIO"
        title={editing ? 'Editar paciente' : 'Novo paciente'}
        description={
          editing
            ? `Atualize os dados de ${editing.nome}.`
            : 'Cadastre os dados pessoais e de atendimento do paciente.'
        }
        fallback={editing ? `/pacientes/${editing.id}` : '/pacientes'}
        backLabel={editing ? 'o prontuário' : returnToReferral ? 'o encaminhamento' : 'pacientes'}
      >
        <form className="subpage-form" onSubmit={submit}>
          <div className="form-section">
            <div className="form-section-title">
              <span>
                <UserRound size={20} />
              </span>
              <div>
                <strong>Dados do prontuário</strong>
                <small>Nome e identificação SUS são obrigatórios</small>
              </div>
            </div>
            <div className="form-grid">
              <label className="field field-wide">
                <span>Nome completo</span>
                <input
                  value={form.nome}
                  onChange={(event) => setForm({ ...form, nome: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Número SUS</span>
                <input
                  value={form.numeroSus}
                  onChange={(event) => setForm({ ...form, numeroSus: event.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  value={form.dataNascimento ?? ''}
                  onChange={(event) => setForm({ ...form, dataNascimento: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Data de entrada</span>
                <input
                  type="date"
                  value={form.dataEntrada ?? ''}
                  onChange={(event) => setForm({ ...form, dataEntrada: event.target.value })}
                />
              </label>
              <label className="field">
                <span>Telefone</span>
                <input
                  value={form.telefone ?? ''}
                  onChange={(event) => setForm({ ...form, telefone: event.target.value })}
                />
              </label>
              <label className="field field-wide">
                <span>Endereço</span>
                <input
                  value={form.endereco ?? ''}
                  onChange={(event) => setForm({ ...form, endereco: event.target.value })}
                />
              </label>
            </div>
          </div>
          <MutationError error={saveMutation.error} />
          <div className="subpage-action-bar">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(
                  editing
                    ? `/pacientes/${editing.id}`
                    : returnToReferral
                      ? '/encaminhamentos/novo'
                      : '/pacientes',
                  returnToReferral
                    ? { state: { referralDraft: locationState?.referralDraft } }
                    : undefined,
                )
              }
            >
              Cancelar
            </button>
            <button className="primary-button" disabled={saveMutation.isPending}>
              <Save size={18} />{' '}
              {saveMutation.isPending
                ? 'Salvando...'
                : editing
                  ? 'Salvar alterações'
                  : 'Criar prontuário'}
            </button>
          </div>
        </form>
      </EstruturaSubpagina>
      <ModalAcaoConcluida
        open={Boolean(savedPatient)}
        title={editingId ? 'Paciente atualizado com sucesso' : 'Paciente cadastrado com sucesso'}
        description="Os dados do prontuário foram confirmados pelo sistema."
        message={
          editingId
            ? 'As alterações já estão disponíveis no prontuário do paciente.'
            : 'O novo prontuário já está disponível para atendimento.'
        }
        actionLabel={
          editingId
            ? 'Voltar para o prontuário'
            : returnToReferral
              ? 'Usar no encaminhamento'
              : 'Voltar para pacientes'
        }
        onClose={closeSuccess}
        details={
          savedPatient
            ? [
                { icon: UserRound, label: 'Paciente', value: savedPatient.nome },
                {
                  icon: IdCard,
                  label: 'Número SUS',
                  tone: 'blue',
                  value: savedPatient.numeroSus,
                },
              ]
            : []
        }
      />
    </>
  )
}

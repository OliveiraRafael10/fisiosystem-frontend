import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Save } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ModalConsultaAgendada } from '../../components/appointments/ModalConsultaAgendada'
import { SeletorDataHora } from '../../components/appointments/SeletorDataHora'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/EstadoApi'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { dataLocal } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import { servicoFisioterapeuta } from '../../services/servicoFisioterapeuta'
import type { ConsultaInput } from '../../types/modelos'

export function FormularioConsulta() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const selectedDate = searchParams.get('data') || dataLocal()
  const [scheduledDateTime, setScheduledDateTime] = useState<string | null>(null)
  const [form, setForm] = useState<ConsultaInput>({
    dataHora: `${selectedDate}T08:00`,
    encaminhamento: { id: 0 },
    fisioterapeuta: { id: 0 },
    observacoes: '',
  })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: servicoEncaminhamento.listar })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: servicoFisioterapeuta.listar })
  const createMutation = useMutation({
    mutationFn: () => servicoConsulta.criar(form),
    onSuccess: (appointment) => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setScheduledDateTime(appointment.dataHora || form.dataHora)
    },
  })
  const availableReferrals = (referrals.data ?? []).filter((item) =>
    ['ASSUMIDO', 'EM_TRATAMENTO'].includes(item.statusEncaminhamento),
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    createMutation.mutate()
  }

  function returnToAppointments() {
    navigate('/consultas', { replace: true })
  }

  if (referrals.isLoading || therapists.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Preparando agenda..." />
      </section>
    )
  if (referrals.isError || therapists.isError)
    return (
      <section className="page-content">
        <ApiError
          error={referrals.error ?? therapists.error}
          retry={() => {
            void referrals.refetch()
            void therapists.refetch()
          }}
        />
      </section>
    )

  return (
    <>
      <EstruturaSubpagina
        eyebrow="AGENDA CLÍNICA"
        title="Agendar consulta"
        description="Defina o caso, o profissional e o horário do atendimento."
        fallback="/consultas"
        backLabel="consultas"
      >
        <form className="subpage-form" onSubmit={submit}>
          <div className="form-section">
            <div className="form-section-title">
              <span>
                <CalendarDays size={20} />
              </span>
              <div>
                <strong>Detalhes do atendimento</strong>
                <small>Somente encaminhamentos assumidos ou em tratamento</small>
              </div>
            </div>
            <div className="form-grid">
              <label className="field field-wide">
                <span>Encaminhamento</span>
                <select
                  value={form.encaminhamento.id}
                  onChange={(event) =>
                    setForm({ ...form, encaminhamento: { id: Number(event.target.value) } })
                  }
                  required
                >
                  <option value={0}>Selecione</option>
                  {availableReferrals.map((item) => (
                    <option value={item.id} key={item.id}>
                      #{item.id} • {item.pacienteNome} • {item.patologia}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Fisioterapeuta</span>
                <select
                  value={form.fisioterapeuta.id}
                  onChange={(event) =>
                    setForm({ ...form, fisioterapeuta: { id: Number(event.target.value) } })
                  }
                  required
                >
                  <option value={0}>Selecione</option>
                  {therapists.data
                    ?.filter((item) => item.ativo)
                    .map((item) => (
                      <option value={item.id} key={item.id}>
                        {item.nome} • {item.crefito}
                      </option>
                    ))}
                </select>
              </label>
              <div className="field field-wide">
                <span>Data e horário</span>
                <SeletorDataHora
                  value={form.dataHora}
                  onChange={(dataHora) => setForm({ ...form, dataHora })}
                />
              </div>
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
            <button type="button" className="secondary-button" onClick={returnToAppointments}>
              Cancelar
            </button>
            <button
              className="primary-button"
              disabled={
                createMutation.isPending || !form.encaminhamento.id || !form.fisioterapeuta.id
              }
            >
              <Save size={18} />
              {createMutation.isPending ? 'Agendando...' : 'Confirmar agendamento'}
            </button>
          </div>
        </form>
      </EstruturaSubpagina>
      <ModalConsultaAgendada dateTime={scheduledDateTime} onClose={returnToAppointments} />
    </>
  )
}

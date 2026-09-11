import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, CalendarX } from 'lucide-react'
import { useState } from 'react'
import { appointmentService } from '../../services/appointmentService'
import type { Consulta } from '../../types'
import { MutationError } from '../ui/ApiState'
import { Modal } from '../ui/Modal'

export type AppointmentQuickAction = 'reschedule' | 'cancel'

export interface AppointmentQuickActionSuccess {
  appointment: Consulta
  kind: 'absence' | 'cancelled' | 'rescheduled'
}

type CancellationKind = 'cancel' | 'absence'

interface AppointmentQuickActionModalsProps {
  action: AppointmentQuickAction | null
  appointment: Consulta | null
  onClose: () => void
  onSuccess: (result: AppointmentQuickActionSuccess) => void
}

function formatAppointmentDateTime(dateTime: string) {
  return new Date(dateTime).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

export function AppointmentQuickActionModals({
  action,
  appointment,
  onClose,
  onSuccess,
}: AppointmentQuickActionModalsProps) {
  const queryClient = useQueryClient()
  const [newDateTime, setNewDateTime] = useState(
    action === 'reschedule' && appointment ? appointment.dataHora.slice(0, 16) : '',
  )
  const [cancellationKind, setCancellationKind] = useState<CancellationKind>('cancel')
  const [observation, setObservation] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!appointment || !action) throw new Error('Consulta não selecionada.')

      if (action === 'reschedule') {
        return appointmentService.reschedule(appointment.id, newDateTime)
      }

      if (cancellationKind === 'absence') {
        return appointmentService.markAbsence(appointment.id, observation.trim())
      }

      return appointmentService.cancel(appointment.id, observation.trim())
    },
    onSuccess: (updatedAppointment) => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      onSuccess({
        appointment: updatedAppointment,
        kind:
          action === 'reschedule'
            ? 'rescheduled'
            : cancellationKind === 'absence'
              ? 'absence'
              : 'cancelled',
      })
    },
  })

  function closeModal() {
    if (mutation.isPending) return
    mutation.reset()
    onClose()
  }

  const description = appointment
    ? `${appointment.pacienteNome} • Consulta #${appointment.id}`
    : undefined
  const appointmentDateTime = appointment ? formatAppointmentDateTime(appointment.dataHora) : '—'

  return (
    <>
      <Modal
        open={action === 'reschedule'}
        title="Remarcar consulta"
        description={description}
        onClose={closeModal}
        size="wide"
      >
        <form
          className="quick-action-modal"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <div className="quick-action-summary">
            <span className="quick-action-summary-icon">
              <CalendarClock size={22} />
            </span>
            <div>
              <span>Horário atual</span>
              <strong>{appointmentDateTime}</strong>
            </div>
          </div>

          <div className="form-section quick-action-form-section">
            <label className="field">
              <span>Nova data e horário</span>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(event) => setNewDateTime(event.target.value)}
                required
              />
            </label>
          </div>

          <MutationError error={mutation.error} />

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={closeModal}
              disabled={mutation.isPending}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={!newDateTime || mutation.isPending}
            >
              {mutation.isPending ? 'Remarcando...' : 'Confirmar remarcação'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={action === 'cancel'}
        title="Registrar cancelamento"
        description={description}
        onClose={closeModal}
        size="wide"
      >
        <form
          className="quick-action-modal"
          onSubmit={(event) => {
            event.preventDefault()
            mutation.mutate()
          }}
        >
          <div className="quick-action-summary quick-action-summary-danger">
            <span className="quick-action-summary-icon">
              <CalendarX size={22} />
            </span>
            <div>
              <span>Consulta agendada para</span>
              <strong>{appointmentDateTime}</strong>
            </div>
          </div>

          <div className="form-section quick-action-form-section quick-action-fields">
            <label className="field">
              <span>Tipo de ocorrência</span>
              <select
                value={cancellationKind}
                onChange={(event) => setCancellationKind(event.target.value as CancellationKind)}
              >
                <option value="cancel">Cancelamento</option>
                <option value="absence">Falta do paciente</option>
              </select>
            </label>
            <label className="field">
              <span>Observação</span>
              <textarea
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                placeholder="Registre o motivo e outras informações relevantes"
                rows={4}
                required
              />
            </label>
          </div>

          <MutationError error={mutation.error} />

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={closeModal}
              disabled={mutation.isPending}
            >
              Voltar
            </button>
            <button
              type="submit"
              className="danger-button"
              disabled={!observation.trim() || mutation.isPending}
            >
              {mutation.isPending
                ? 'Registrando...'
                : cancellationKind === 'absence'
                  ? 'Registrar falta'
                  : 'Confirmar cancelamento'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

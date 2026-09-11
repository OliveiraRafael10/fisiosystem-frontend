import { ArrowRight, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react'
import { formatDate } from '../../lib/domain'
import { Modal } from '../ui/Modal'

interface AppointmentScheduledModalProps {
  dateTime: string | null
  onClose: () => void
}

export function AppointmentScheduledModal({ dateTime, onClose }: AppointmentScheduledModalProps) {
  const [date = '', rawTime = ''] = dateTime?.split('T') ?? []
  const time = rawTime.slice(0, 5)

  return (
    <Modal
      open={Boolean(dateTime)}
      title="Consulta agendada com sucesso"
      description="O atendimento foi incluído na agenda clínica."
      onClose={onClose}
      size="medium"
    >
      <div className="grid gap-5 p-6 max-[560px]:p-4">
        <section className="flex items-center gap-4 rounded-[18px] border border-[#cbe4d8] bg-gradient-to-br from-[#e9f7f1] to-white p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-[0_10px_24px_rgba(25,116,92,0.22)]">
            <CheckCircle2 size={28} strokeWidth={2.2} />
          </span>
          <div>
            <strong className="font-display block text-xl text-[#204b3d]">Horário reservado</strong>
            <p className="mt-1 mb-0 text-sm leading-6 text-[#677d74]">
              A consulta já está disponível para acompanhamento na agenda.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
          <div className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-[#d8e5df] bg-white p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-brand-100 text-brand-700">
              <CalendarDays size={21} />
            </span>
            <div>
              <span className="block text-[13px] font-semibold text-[#788a82]">Data</span>
              <strong className="mt-1 block text-base text-[#2b5143]">{formatDate(date)}</strong>
            </div>
          </div>
          <div className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-[#d8e5df] bg-white p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-[#eaf2f9] text-[#527fa4]">
              <Clock3 size={21} />
            </span>
            <div>
              <span className="block text-[13px] font-semibold text-[#788a82]">Horário</span>
              <strong className="mt-1 block text-base text-[#2b5143]">{time || '—'}</strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-brand-700 px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(25,116,92,0.2)] transition hover:bg-brand-800"
          onClick={onClose}
        >
          Voltar para consultas
          <ArrowRight size={19} />
        </button>
      </div>
    </Modal>
  )
}

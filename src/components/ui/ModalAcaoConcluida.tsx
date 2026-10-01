import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react'
import { Modal } from './Modal'

type DetailTone = 'blue' | 'brand' | 'orange'

export interface SuccessModalDetail {
  icon: LucideIcon
  label: string
  tone?: DetailTone
  value: string
}

interface ModalAcaoConcluidaProps {
  actionLabel: string
  description: string
  details?: SuccessModalDetail[]
  message: string
  onClose: () => void
  open: boolean
  title: string
}

const detailToneClasses: Record<DetailTone, string> = {
  blue: 'bg-[#eaf2f9] text-[#527fa4]',
  brand: 'bg-brand-100 text-brand-700',
  orange: 'bg-[#fff1e6] text-[#b96b36]',
}

export function ModalAcaoConcluida({
  actionLabel,
  description,
  details = [],
  message,
  onClose,
  open,
  title,
}: ModalAcaoConcluidaProps) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose} size="medium">
      <div className="grid gap-5 p-6 max-[560px]:p-4">
        <section className="flex items-center gap-4 rounded-[18px] border border-[#cbe4d8] bg-linear-to-br from-[#e9f7f1] to-white p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-white shadow-[0_10px_24px_rgba(25,116,92,0.22)]">
            <CheckCircle2 size={28} strokeWidth={2.2} />
          </span>
          <div>
            <strong className="font-display block text-xl text-[#204b3d]">
              Operação concluída
            </strong>
            <p className="mt-1 mb-0 text-sm leading-6 text-[#677d74]">{message}</p>
          </div>
        </section>

        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
            {details.map(({ icon: Icon, label, tone = 'brand', value }) => (
              <div
                className="flex min-h-23 items-center gap-3 rounded-2xl border border-[#d8e5df] bg-white p-4"
                key={`${label}-${value}`}
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-[13px] ${detailToneClasses[tone]}`}
                >
                  <Icon size={21} />
                </span>
                <div className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[#788a82]">{label}</span>
                  <strong className="mt-1 block wrap-break-word text-base leading-5 text-[#2b5143]">
                    {value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-brand-700 px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(25,116,92,0.2)] transition hover:bg-brand-800"
          onClick={onClose}
        >
          {actionLabel}
          <ArrowRight size={19} />
        </button>
      </div>
    </Modal>
  )
}

import type { LucideIcon } from 'lucide-react'

type ReferralMetricTone = 'blue' | 'green' | 'orange' | 'red'

interface ReferralMetricCardProps {
  icon: LucideIcon
  label: string
  supportingText: string
  tone: ReferralMetricTone
  value: number
}

const toneStyles: Record<
  ReferralMetricTone,
  { accent: string; icon: string; supportingText: string }
> = {
  blue: {
    accent: 'bg-[#72a8cf]',
    icon: 'border-[#d8e8f4] bg-[#edf5fb] text-[#477ca5]',
    supportingText: 'bg-[#edf5fb] text-[#527994]',
  },
  green: {
    accent: 'bg-[#5aa989]',
    icon: 'border-[#d2e9de] bg-[#e8f6f0] text-[#24765d]',
    supportingText: 'bg-[#e8f6f0] text-[#36735e]',
  },
  orange: {
    accent: 'bg-[#e79a61]',
    icon: 'border-[#f3dbc8] bg-[#fff2e8] text-[#b96832]',
    supportingText: 'bg-[#fff2e8] text-[#a96639]',
  },
  red: {
    accent: 'bg-[#df7868]',
    icon: 'border-[#f1d5cf] bg-[#fff0ed] text-[#bd5141]',
    supportingText: 'bg-[#fff0ed] text-[#ad5a4c]',
  },
}

export function ReferralMetricCard({
  icon: Icon,
  label,
  supportingText,
  tone,
  value,
}: ReferralMetricCardProps) {
  const styles = toneStyles[tone]

  return (
    <article className="relative flex min-h-[154px] flex-col justify-between overflow-hidden rounded-[20px] border border-[#d8e4dd] bg-white p-5 shadow-[0_12px_32px_rgba(30,76,60,0.055)]">
      <span className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-[14px] border ${styles.icon}`}
          aria-hidden="true"
        >
          <Icon size={21} strokeWidth={1.9} />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-right text-[13px] leading-5 font-semibold ${styles.supportingText}`}
        >
          {supportingText}
        </span>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <strong className="font-display text-[32px] leading-none font-bold tracking-[-1px] text-[#183f34]">
          {value}
        </strong>
        <p className="m-0 pb-0.5 text-base leading-5 font-medium text-[#667b72]">{label}</p>
      </div>
    </article>
  )
}

import type { ReactNode } from 'react'

interface StatusBadgeProps {
  children: ReactNode
}

export function StatusBadge({ children }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#edf1f0] px-2.5 py-1.5 text-[13px] font-bold text-[#7e8b89]">
      <i className="h-1.5 w-1.5 rounded-full bg-[#98a3a2]" />
      {children}
    </span>
  )
}

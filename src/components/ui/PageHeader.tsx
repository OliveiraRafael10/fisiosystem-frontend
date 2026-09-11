import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-[30px] flex items-center justify-between gap-6 max-[760px]:items-start max-[760px]:gap-3">
      <div className="max-w-[720px]">
        <p className="mb-2.5 text-xs font-bold tracking-[0.165em] text-[#2c7a60] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display mb-2 text-[clamp(36px,3.4vw,46px)] leading-[1.08] font-bold tracking-[-1.4px] text-[#173a31] max-[680px]:text-[34px]">
          {title}
        </h1>
        <p className="m-0 text-lg leading-[1.55] text-[#72817a] max-[680px]:text-[17px]">
          {description}
        </p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

import { ArrowLeft, HeartPulse } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface EstruturaSubpaginaProps {
  eyebrow: string
  title: string
  description?: string
  fallback: string
  backLabel: string
  children: ReactNode
  actions?: ReactNode
}

export function EstruturaSubpagina({
  eyebrow,
  title,
  description,
  fallback,
  backLabel,
  children,
  actions,
}: EstruturaSubpaginaProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  return (
    <section className="page-content subpage-shell">
      <button className="subpage-back" type="button" onClick={() => navigate(from || fallback)}>
        <ArrowLeft size={22} />
        <span>Voltar para {backLabel}</span>
      </button>
      <header className="subpage-header">
        <span className="subpage-header-icon">
          <HeartPulse size={27} />
        </span>
        <div>
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="subpage-header-actions">{actions}</div>}
      </header>
      <div className="subpage-surface">{children}</div>
    </section>
  )
}

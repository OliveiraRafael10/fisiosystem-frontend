import { useEffect, useRef, type ReactNode } from 'react'
import { Activity, X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  size?: 'medium' | 'large' | 'wide'
  variant?: 'default' | 'referral'
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  size = 'medium',
  variant = 'default',
}: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`modal-card modal-${size} modal-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <header className="modal-header">
          <div className="modal-heading-icon" aria-hidden="true">
            <Activity size={20} />
          </div>
          <div className="modal-heading-copy">
            <span>FisioSystem</span>
            <h2 id="modal-title">{title}</h2>
            {description && <p id="modal-description">{description}</p>}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar janela"
            title="Fechar"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}

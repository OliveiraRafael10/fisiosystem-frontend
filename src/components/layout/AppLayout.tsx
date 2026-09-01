import { useEffect, useState, type FormEvent } from 'react'
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  FileChartColumnIncreasing,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Search,
  Stethoscope,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface ModelTool {
  name: string
  title: string
  description: string
  inputSchema: object
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }
  execute: (input: unknown) => unknown | Promise<unknown>
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: ModelTool, options?: { signal: AbortSignal }) => void | Promise<void>
    }
  }
}

const menu = [
  { label: 'Visão geral', to: '/', icon: LayoutDashboard },
  { label: 'Pacientes', to: '/pacientes', icon: UsersRound },
  { label: 'Encaminhamentos', to: '/encaminhamentos', icon: ClipboardPlus },
  { label: 'Consultas', to: '/consultas', icon: CalendarDays },
  { label: 'Fisioterapeutas', to: '/fisioterapeutas', icon: Stethoscope },
  { label: 'Relatórios', to: '/relatorios', icon: FileChartColumnIncreasing },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setMobileOpen(false)
    setNotificationsOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    const context = document.modelContext
    if (!context?.registerTool) return
    const lifecycle = new AbortController()
    const tools: ModelTool[] = [
      {
        name: 'start_patient_registration',
        title: 'Iniciar cadastro de paciente',
        description: 'Abre o formulário visível para cadastrar um novo paciente no FisioSystem.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: () => {
          navigate('/pacientes')
          window.setTimeout(() => window.dispatchEvent(new CustomEvent('fisio:new-patient')), 50)
          return { route: '/pacientes', form: 'opened' }
        },
      },
      {
        name: 'search_patients',
        title: 'Buscar pacientes',
        description: 'Abre a lista de pacientes e aplica uma busca por nome ou CPF.',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string', minLength: 1 } },
          required: ['query'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: (input) => {
          if (!input || typeof input !== 'object' || !('query' in input) || typeof input.query !== 'string' || !input.query.trim()) {
            throw new Error('Informe um termo de busca válido.')
          }
          const query = input.query.trim()
          navigate(`/pacientes?busca=${encodeURIComponent(query)}`)
          return { route: '/pacientes', query }
        },
      },
    ]
    tools.forEach((tool) => {
      try {
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined)
      } catch {
        return
      }
    })
    return () => lifecycle.abort()
  }, [navigate])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    if (!search.trim()) return
    navigate(`/pacientes?busca=${encodeURIComponent(search.trim())}`)
  }

  function openPatientForm() {
    navigate('/pacientes')
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('fisio:new-patient')), 50)
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-symbol"><HeartPulse size={22} /></span>
          <span><strong>Fisio</strong>System</span>
          <button className="sidebar-close" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>
        <nav className="nav-list" aria-label="Navegação principal">
          <p className="nav-label">ATENDIMENTO</p>
          {menu.slice(0, 5).map(({ label, to, icon: Icon }) => (
            <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to={to} end={to === '/'} key={label}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <span className="active-dot" />
            </NavLink>
          ))}
          <p className="nav-label nav-separator">GESTÃO</p>
          {menu.slice(5).map(({ label, to, icon: Icon }) => (
            <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to={to} key={label}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <span className="active-dot" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="sidebar-card-icon"><Activity size={18} /></span>
          <div><strong>Ambiente operacional</strong><small>API v1 configurada</small></div>
        </div>
        <div className="profile-mini">
          <span className="avatar">RM</span>
          <div><strong>Rafa Martins</strong><small>Administrador</small></div>
          <ChevronRight size={17} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar paciente, CPF ou encaminhamento..." aria-label="Busca global" />
            <kbd>Enter</kbd>
          </form>
          <div className="topbar-actions">
            <div className="notification-wrap">
              <button className="icon-button" aria-label="Notificações" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={19} /><span /></button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div><strong>Notificações</strong><span>3 novas</span></div>
                  <button><i className="notice-dot urgent" /><span><strong>Prioridade alta</strong><small>Joana Ferreira aguarda vaga há 12 dias.</small></span></button>
                  <button><i className="notice-dot" /><span><strong>Consulta em 20 minutos</strong><small>Carlos Eduardo • Ortopedia.</small></span></button>
                  <button><i className="notice-dot success" /><span><strong>Prontuário atualizado</strong><small>Helena Martins teve evolução registrada.</small></span></button>
                </div>
              )}
            </div>
            <button className="primary-button" onClick={openPatientForm}><UserRoundPlus size={18} /> Novo paciente</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

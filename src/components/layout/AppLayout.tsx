import { useEffect, useState } from 'react'
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardPlus,
  FileChartColumnIncreasing,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Stethoscope,
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

  useEffect(() => {
    setMobileOpen(false)
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
          navigate('/pacientes/novo', { state: { from: '/pacientes' } })
          return { route: '/pacientes/novo', form: 'opened' }
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
          if (
            !input ||
            typeof input !== 'object' ||
            !('query' in input) ||
            typeof input.query !== 'string' ||
            !input.query.trim()
          ) {
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
        void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(
          () => undefined,
        )
      } catch {
        return
      }
    })
    return () => lifecycle.abort()
  }, [navigate])

  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <span className="brand-symbol">
            <HeartPulse size={22} />
          </span>
          <span>
            <strong>Fisio</strong>System
          </span>
          <button
            className="sidebar-close"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Navegação principal">
          <p className="nav-label">ATENDIMENTO</p>
          {menu.slice(0, 5).map(({ label, to, icon: Icon }) => (
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              to={to}
              end={to === '/'}
              key={label}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <span className="active-dot" />
            </NavLink>
          ))}
          <p className="nav-label nav-separator">GESTÃO</p>
          {menu.slice(5).map(({ label, to, icon: Icon }) => (
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              to={to}
              key={label}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              <span className="active-dot" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <span className="sidebar-card-icon">
            <Activity size={18} />
          </span>
          <div>
            <strong>Ambiente operacional</strong>
            <small>Backend Spring integrado</small>
          </div>
        </div>
        <div className="profile-mini">
          <span className="avatar">RM</span>
          <div>
            <strong>Rafa Martins</strong>
            <small>Administrador</small>
          </div>
          <ChevronRight size={17} />
        </div>
      </aside>

      <main className="main-content">
        <button
          className="mobile-menu mobile-menu-floating"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={23} />
        </button>
        <Outlet />
      </main>
    </div>
  )
}

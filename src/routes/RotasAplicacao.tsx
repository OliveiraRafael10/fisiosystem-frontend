import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LayoutAplicacao } from '../components/layout/LayoutAplicacao'

const PaginaPainel = lazy(() =>
  import('../pages/Dashboard/PaginaPainel').then((module) => ({ default: module.PaginaPainel })),
)
const PaginaPacientes = lazy(() =>
  import('../pages/Pacientes/PaginaPacientes').then((module) => ({
    default: module.PaginaPacientes,
  })),
)
const PaginaEncaminhamentos = lazy(() =>
  import('../pages/Encaminhamentos/PaginaEncaminhamentos').then((module) => ({
    default: module.PaginaEncaminhamentos,
  })),
)
const PaginaConsultas = lazy(() =>
  import('../pages/Consultas/PaginaConsultas').then((module) => ({
    default: module.PaginaConsultas,
  })),
)
const PaginaFisioterapeutas = lazy(() =>
  import('../pages/Fisioterapeutas/PaginaFisioterapeutas').then((module) => ({
    default: module.PaginaFisioterapeutas,
  })),
)
const PaginaRelatorios = lazy(() =>
  import('../pages/Relatorios/PaginaRelatorios').then((module) => ({
    default: module.PaginaRelatorios,
  })),
)
const AlertasPainel = lazy(() =>
  import('../pages/Dashboard/AlertasPainel').then((module) => ({
    default: module.AlertasPainel,
  })),
)
const FormularioPaciente = lazy(() =>
  import('../pages/Pacientes/FormularioPaciente').then((module) => ({
    default: module.FormularioPaciente,
  })),
)
const DetalhePaciente = lazy(() =>
  import('../pages/Pacientes/DetalhePaciente').then((module) => ({
    default: module.DetalhePaciente,
  })),
)
const FormularioEncaminhamento = lazy(() =>
  import('../pages/Encaminhamentos/FormularioEncaminhamento').then((module) => ({
    default: module.FormularioEncaminhamento,
  })),
)
const DetalheEncaminhamento = lazy(() =>
  import('../pages/Encaminhamentos/DetalheEncaminhamento').then((module) => ({
    default: module.DetalheEncaminhamento,
  })),
)
const FormularioConsulta = lazy(() =>
  import('../pages/Consultas/FormularioConsulta').then((module) => ({
    default: module.FormularioConsulta,
  })),
)
const DetalheConsulta = lazy(() =>
  import('../pages/Consultas/DetalheConsulta').then((module) => ({
    default: module.DetalheConsulta,
  })),
)
const FormularioFisioterapeuta = lazy(() =>
  import('../pages/Fisioterapeutas/FormularioFisioterapeuta').then((module) => ({
    default: module.FormularioFisioterapeuta,
  })),
)
const DetalheFisioterapeuta = lazy(() =>
  import('../pages/Fisioterapeutas/DetalheFisioterapeuta').then((module) => ({
    default: module.DetalheFisioterapeuta,
  })),
)

export function RotasAplicacao() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="route-loading">
            <span />
            <strong>Carregando...</strong>
          </div>
        }
      >
        <Routes>
          <Route element={<LayoutAplicacao />}>
            <Route index element={<PaginaPainel />} />
            <Route path="alertas" element={<AlertasPainel />} />
            <Route path="pacientes" element={<PaginaPacientes />} />
            <Route path="pacientes/novo" element={<FormularioPaciente />} />
            <Route path="pacientes/:patientId" element={<DetalhePaciente />} />
            <Route path="pacientes/:patientId/editar" element={<FormularioPaciente />} />
            <Route path="encaminhamentos" element={<PaginaEncaminhamentos />} />
            <Route path="encaminhamentos/novo" element={<FormularioEncaminhamento />} />
            <Route path="encaminhamentos/:referralId" element={<DetalheEncaminhamento />} />
            <Route path="consultas" element={<PaginaConsultas />} />
            <Route path="consultas/nova" element={<FormularioConsulta />} />
            <Route path="consultas/:appointmentId" element={<DetalheConsulta />} />
            <Route path="fisioterapeutas" element={<PaginaFisioterapeutas />} />
            <Route path="fisioterapeutas/novo" element={<FormularioFisioterapeuta />} />
            <Route path="fisioterapeutas/:therapistId" element={<DetalheFisioterapeuta />} />
            <Route path="relatorios" element={<PaginaRelatorios />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

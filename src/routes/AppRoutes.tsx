import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'

const DashboardPage = lazy(() =>
  import('../pages/Dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const PatientsPage = lazy(() =>
  import('../pages/Pacientes/PatientsPage').then((module) => ({ default: module.PatientsPage })),
)
const ReferralsPage = lazy(() =>
  import('../pages/Encaminhamentos/ReferralsPage').then((module) => ({
    default: module.ReferralsPage,
  })),
)
const AppointmentsPage = lazy(() =>
  import('../pages/Consultas/AppointmentsPage').then((module) => ({
    default: module.AppointmentsPage,
  })),
)
const TherapistsPage = lazy(() =>
  import('../pages/Fisioterapeutas/TherapistsPage').then((module) => ({
    default: module.TherapistsPage,
  })),
)
const ReportsPage = lazy(() =>
  import('../pages/Relatorios/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const DashboardAlertsPage = lazy(() =>
  import('../pages/Dashboard/DashboardAlertsPage').then((module) => ({
    default: module.DashboardAlertsPage,
  })),
)
const PatientFormPage = lazy(() =>
  import('../pages/Pacientes/PatientFormPage').then((module) => ({
    default: module.PatientFormPage,
  })),
)
const PatientDetailPage = lazy(() =>
  import('../pages/Pacientes/PatientDetailPage').then((module) => ({
    default: module.PatientDetailPage,
  })),
)
const ReferralFormPage = lazy(() =>
  import('../pages/Encaminhamentos/ReferralFormPage').then((module) => ({
    default: module.ReferralFormPage,
  })),
)
const ReferralDetailPage = lazy(() =>
  import('../pages/Encaminhamentos/ReferralDetailPage').then((module) => ({
    default: module.ReferralDetailPage,
  })),
)
const AppointmentFormPage = lazy(() =>
  import('../pages/Consultas/AppointmentFormPage').then((module) => ({
    default: module.AppointmentFormPage,
  })),
)
const AppointmentDetailPage = lazy(() =>
  import('../pages/Consultas/AppointmentDetailPage').then((module) => ({
    default: module.AppointmentDetailPage,
  })),
)
const TherapistFormPage = lazy(() =>
  import('../pages/Fisioterapeutas/TherapistFormPage').then((module) => ({
    default: module.TherapistFormPage,
  })),
)
const TherapistDetailPage = lazy(() =>
  import('../pages/Fisioterapeutas/TherapistDetailPage').then((module) => ({
    default: module.TherapistDetailPage,
  })),
)

export function AppRoutes() {
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
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="alertas" element={<DashboardAlertsPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/novo" element={<PatientFormPage />} />
            <Route path="pacientes/:patientId" element={<PatientDetailPage />} />
            <Route path="pacientes/:patientId/editar" element={<PatientFormPage />} />
            <Route path="encaminhamentos" element={<ReferralsPage />} />
            <Route path="encaminhamentos/novo" element={<ReferralFormPage />} />
            <Route path="encaminhamentos/:referralId" element={<ReferralDetailPage />} />
            <Route path="consultas" element={<AppointmentsPage />} />
            <Route path="consultas/nova" element={<AppointmentFormPage />} />
            <Route path="consultas/:appointmentId" element={<AppointmentDetailPage />} />
            <Route path="fisioterapeutas" element={<TherapistsPage />} />
            <Route path="fisioterapeutas/novo" element={<TherapistFormPage />} />
            <Route path="fisioterapeutas/:therapistId" element={<TherapistDetailPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

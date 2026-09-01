import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'

const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const PatientsPage = lazy(() => import('../pages/Pacientes/PatientsPage').then((module) => ({ default: module.PatientsPage })))
const ReferralsPage = lazy(() => import('../pages/Encaminhamentos/ReferralsPage').then((module) => ({ default: module.ReferralsPage })))
const AppointmentsPage = lazy(() => import('../pages/Consultas/AppointmentsPage').then((module) => ({ default: module.AppointmentsPage })))
const TherapistsPage = lazy(() => import('../pages/Fisioterapeutas/TherapistsPage').then((module) => ({ default: module.TherapistsPage })))
const ReportsPage = lazy(() => import('../pages/Relatorios/ReportsPage').then((module) => ({ default: module.ReportsPage })))

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="route-loading"><span /><strong>Carregando...</strong></div>}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="encaminhamentos" element={<ReferralsPage />} />
            <Route path="consultas" element={<AppointmentsPage />} />
            <Route path="fisioterapeutas" element={<TherapistsPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

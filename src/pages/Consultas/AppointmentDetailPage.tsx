import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ClipboardList, HeartPulse, Stethoscope, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReferralConsultationHistory } from '../../components/referrals/ReferralConsultationHistory'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { formatDateTime } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'
import { referralService } from '../../services/referralService'

export function AppointmentDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const appointmentId = Number(useParams().appointmentId)
  const [clinical, setClinical] = useState({ diagnostico: '', procedimentos: '', conduta: '' })
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: appointmentService.list })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const appointment = appointments.data?.find((item) => item.id === appointmentId)
  const referral = referrals.data?.find((item) => item.id === appointment?.encaminhamentoId)
  const actionMutation = useMutation({
    mutationFn: () => appointmentService.complete(appointmentId, clinical),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setClinical({ diagnostico: '', procedimentos: '', conduta: '' })
    },
  })

  if (appointments.isLoading || referrals.isLoading) return <section className="page-content"><ApiLoading label="Carregando consulta..." /></section>
  if (appointments.isError || referrals.isError) return <section className="page-content"><ApiError error={appointments.error ?? referrals.error} retry={() => { void appointments.refetch(); void referrals.refetch() }} /></section>
  if (!appointment) return <section className="page-content"><ApiError error={new Error('Consulta não encontrada.')} retry={() => navigate('/consultas')} /></section>

  return (
    <SubpageShell eyebrow={`CONSULTA #${appointment.id}`} title={appointment.pacienteNome || 'Paciente não informado'} description={formatDateTime(appointment.dataHora)} fallback="/consultas" backLabel="consultas">
      <div className="patient-profile subpage-profile appointment-detail-profile">
        <section className="appointment-context-card">
          <header className="appointment-context-heading">
            <span><ClipboardList size={22} /></span>
            <div><h2>Contexto do encaminhamento</h2><p>Informações essenciais para conduzir este atendimento</p></div>
          </header>
          <div className="appointment-context-grid">
            <div><span className="appointment-context-icon"><Stethoscope size={20} /></span><span>Médico solicitante</span><strong>{referral?.medicoSolicitante || 'Não informado'}</strong></div>
            <div><span className="appointment-context-icon"><HeartPulse size={20} /></span><span>Patologia</span><strong>{referral?.patologia || 'Não informada'}</strong></div>
            <div><span className="appointment-context-icon"><UserRound size={20} /></span><span>Fisioterapeuta responsável</span><strong>{referral?.fisioterapeutaResponsavelNome || appointment.fisioterapeutaNome || 'Não informado'}</strong></div>
            <div><span className="appointment-context-icon"><ClipboardList size={20} /></span><span>Número do encaminhamento</span><strong>#{appointment.encaminhamentoId}</strong></div>
          </div>
        </section>

        <ReferralConsultationHistory referralId={appointment.encaminhamentoId} excludeAppointmentId={appointment.id} beforeDateTime={appointment.dataHora} />

        {appointment.status === 'AGENDADA' && <>
          <div className="form-section appointment-clinical-form"><div className="form-section-title"><span><CheckCircle2 size={20} /></span><div><strong>Registro clínico</strong><small>Documente o atendimento realizado</small></div></div><div className="form-grid"><label className="field field-wide"><span>Diagnóstico</span><textarea value={clinical.diagnostico} onChange={(event) => setClinical({ ...clinical, diagnostico: event.target.value })} /></label><label className="field field-wide"><span>Procedimentos</span><textarea value={clinical.procedimentos} onChange={(event) => setClinical({ ...clinical, procedimentos: event.target.value })} /></label><label className="field field-wide"><span>Conduta</span><textarea value={clinical.conduta} onChange={(event) => setClinical({ ...clinical, conduta: event.target.value })} /></label></div></div>
          <MutationError error={actionMutation.error} />
          <div className="subpage-action-bar"><button className="primary-button" disabled={actionMutation.isPending || Object.values(clinical).some((value) => !value.trim())} onClick={() => actionMutation.mutate()}>{actionMutation.isPending ? 'Salvando consulta...' : 'Finalizar e salvar consulta'}</button></div>
        </>}
        {appointment.status !== 'AGENDADA' && <div className="form-section clinical-record"><h3>Registro clínico</h3><dl><div><dt>Diagnóstico</dt><dd>{appointment.diagnostico || 'Não informado'}</dd></div><div><dt>Procedimentos</dt><dd>{appointment.procedimentos || 'Não informado'}</dd></div><div><dt>Conduta</dt><dd>{appointment.conduta || 'Não informada'}</dd></div><div><dt>Observações</dt><dd>{appointment.observacoes || 'Sem observações'}</dd></div></dl></div>}
      </div>
    </SubpageShell>
  )
}

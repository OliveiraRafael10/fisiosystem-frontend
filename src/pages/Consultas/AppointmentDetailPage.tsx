import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { formatDateTime, getStatusConsultaLabel, initials } from '../../lib/domain'
import { appointmentService } from '../../services/appointmentService'

type AppointmentAction = 'complete' | 'reschedule' | 'cancel' | 'absence'

export function AppointmentDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const appointmentId = Number(useParams().appointmentId)
  const [action, setAction] = useState<AppointmentAction>('complete')
  const [clinical, setClinical] = useState({ diagnostico: '', procedimentos: '', conduta: '' })
  const [observation, setObservation] = useState('')
  const [newDateTime, setNewDateTime] = useState('')
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: appointmentService.list })
  const appointment = appointments.data?.find((item) => item.id === appointmentId)
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (action === 'complete') return appointmentService.complete(appointmentId, clinical)
      if (action === 'reschedule') return appointmentService.reschedule(appointmentId, newDateTime)
      if (action === 'cancel') return appointmentService.cancel(appointmentId, observation)
      return appointmentService.markAbsence(appointmentId, observation)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setClinical({ diagnostico: '', procedimentos: '', conduta: '' })
      setObservation('')
      setNewDateTime('')
    },
  })

  if (appointments.isLoading) return <section className="page-content"><ApiLoading label="Carregando consulta..." /></section>
  if (appointments.isError) return <section className="page-content"><ApiError error={appointments.error} retry={() => void appointments.refetch()} /></section>
  if (!appointment) return <section className="page-content"><ApiError error={new Error('Consulta não encontrada.')} retry={() => navigate('/consultas')} /></section>

  return (
    <SubpageShell eyebrow={`CONSULTA #${appointment.id}`} title={appointment.pacienteNome || 'Paciente não informado'} description={`${formatDateTime(appointment.dataHora)} • ${appointment.fisioterapeutaNome || 'Profissional não informado'}`} fallback="/consultas" backLabel="consultas">
      <div className="patient-profile subpage-profile">
        <div className="profile-hero"><span className="profile-avatar">{initials(appointment.pacienteNome)}</span><div><StatusBadge>{getStatusConsultaLabel(appointment.status)}</StatusBadge><h3>{appointment.pacienteNome || 'Paciente não informado'}</h3><p>Encaminhamento #{appointment.encaminhamentoId}</p></div></div>
        {appointment.status === 'AGENDADA' && <>
          <div className="filter-tabs subpage-action-tabs">{([['complete', 'Realizar consulta'], ['reschedule', 'Reagendar'], ['cancel', 'Cancelar'], ['absence', 'Registrar falta']] as const).map(([value, label]) => <button className={action === value ? 'selected' : ''} onClick={() => { setAction(value); actionMutation.reset() }} key={value}>{label}</button>)}</div>
          {action === 'complete' && <div className="form-section"><div className="form-section-title"><span><CheckCircle2 size={20} /></span><div><strong>Registro clínico</strong><small>Documente o atendimento realizado</small></div></div><div className="form-grid"><label className="field field-wide"><span>Diagnóstico</span><textarea value={clinical.diagnostico} onChange={(event) => setClinical({ ...clinical, diagnostico: event.target.value })} /></label><label className="field field-wide"><span>Procedimentos</span><textarea value={clinical.procedimentos} onChange={(event) => setClinical({ ...clinical, procedimentos: event.target.value })} /></label><label className="field field-wide"><span>Conduta</span><textarea value={clinical.conduta} onChange={(event) => setClinical({ ...clinical, conduta: event.target.value })} /></label></div></div>}
          {action === 'reschedule' && <div className="form-section"><label className="field"><span>Nova data e horário</span><input type="datetime-local" value={newDateTime} onChange={(event) => setNewDateTime(event.target.value)} /></label></div>}
          {['cancel', 'absence'].includes(action) && <div className="form-section"><label className="field field-wide"><span>Observação</span><textarea value={observation} onChange={(event) => setObservation(event.target.value)} /></label></div>}
          <MutationError error={actionMutation.error} />
          <div className="subpage-action-bar"><button className="primary-button" disabled={actionMutation.isPending || (action === 'complete' && Object.values(clinical).some((value) => !value.trim())) || (action === 'reschedule' && !newDateTime)} onClick={() => actionMutation.mutate()}>{actionMutation.isPending ? 'Salvando...' : 'Confirmar ação'}</button></div>
        </>}
        {appointment.status !== 'AGENDADA' && <div className="form-section clinical-record"><h3>Registro clínico</h3><dl><div><dt>Diagnóstico</dt><dd>{appointment.diagnostico || 'Não informado'}</dd></div><div><dt>Procedimentos</dt><dd>{appointment.procedimentos || 'Não informado'}</dd></div><div><dt>Conduta</dt><dd>{appointment.conduta || 'Não informada'}</dd></div><div><dt>Observações</dt><dd>{appointment.observacoes || 'Sem observações'}</dd></div></dl></div>}
      </div>
    </SubpageShell>
  )
}

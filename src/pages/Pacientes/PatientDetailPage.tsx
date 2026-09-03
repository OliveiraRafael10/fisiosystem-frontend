import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ClipboardPlus, MapPin, Pencil, Phone } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/ApiState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { formatDate, getPrioridadeLabel, getStatusEncaminhamentoLabel, initials, priorityTone } from '../../lib/domain'
import { patientService } from '../../services/patientService'
import { referralService } from '../../services/referralService'

export function PatientDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const patientId = Number(useParams().patientId)
  const patients = useQuery({ queryKey: ['patients'], queryFn: patientService.list })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const patient = patients.data?.find((item) => item.id === patientId)

  if (patients.isLoading || referrals.isLoading) return <section className="page-content"><ApiLoading label="Carregando prontuário..." /></section>
  if (patients.isError || referrals.isError) return <section className="page-content"><ApiError error={patients.error ?? referrals.error} retry={() => { void patients.refetch(); void referrals.refetch() }} /></section>
  if (!patient) return <section className="page-content"><ApiError error={new Error('Paciente não encontrado.')} retry={() => navigate('/pacientes')} /></section>

  const patientReferrals = (referrals.data ?? []).filter((item) => item.pacienteId === patient.id)
  const inTreatment = patientReferrals.some((item) => item.statusEncaminhamento === 'EM_TRATAMENTO')

  return (
    <SubpageShell eyebrow={`PACIENTE #${String(patient.id).padStart(5, '0')}`} title={patient.nome} description={`Cartão SUS ${patient.numeroSus}`} fallback="/pacientes" backLabel="pacientes" actions={<button className="subpage-header-button" onClick={() => navigate(`/pacientes/${patient.id}/editar`, { state: { from: location.pathname } })}><Pencil size={18} /> Editar dados</button>}>
      <div className="patient-profile subpage-profile">
        <div className="profile-hero"><span className="profile-avatar">{initials(patient.nome)}</span><div><StatusBadge>{inTreatment ? 'Em tratamento' : 'Cadastrado'}</StatusBadge><h3>{patient.nome}</h3><p>SUS {patient.numeroSus}</p></div></div>
        <div className="profile-info-grid"><div><span><CalendarDays size={17} /> Nascimento</span><strong>{formatDate(patient.dataNascimento)}</strong></div><div><span><Phone size={17} /> Telefone</span><strong>{patient.telefone || 'Não informado'}</strong></div><div><span><MapPin size={17} /> Endereço</span><strong>{patient.endereco || 'Não informado'}</strong></div><div><span><CalendarDays size={17} /> Entrada</span><strong>{formatDate(patient.dataEntrada)}</strong></div></div>
        <div className="profile-section-heading"><div><span><ClipboardPlus size={19} /></span><div><strong>Jornada de cuidado</strong><small>Encaminhamentos vinculados ao paciente</small></div></div></div>
        <div className="subpage-card-list">{patientReferrals.map((referral) => <button className="care-card" key={referral.id} onClick={() => navigate(`/encaminhamentos/${referral.id}`, { state: { from: location.pathname } })}><div className="care-card-top"><span className={`priority-pill priority-${priorityTone(referral.prioridade)}`}>{getPrioridadeLabel(referral.prioridade)}</span><StatusBadge>{getStatusEncaminhamentoLabel(referral.statusEncaminhamento)}</StatusBadge></div><h4>{referral.patologia || 'Patologia não informada'}</h4><p>{referral.medicoSolicitante || 'Médico não informado'} • {referral.tipoAtendimento || 'Tipo não informado'}</p></button>)}</div>
        {!patientReferrals.length && <div className="empty-care"><ClipboardPlus size={24} /><strong>Nenhum encaminhamento</strong><p>Este prontuário ainda não possui jornada de cuidado.</p></div>}
      </div>
    </SubpageShell>
  )
}

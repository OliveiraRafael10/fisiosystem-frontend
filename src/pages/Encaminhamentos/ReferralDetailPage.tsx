import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReferralConsultationHistory } from '../../components/referrals/ReferralConsultationHistory'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/ApiState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { SubpageShell } from '../../components/ui/SubpageShell'
import { formatDate, getPrioridadeLabel, getStatusEncaminhamentoLabel, initials } from '../../lib/domain'
import { referralService } from '../../services/referralService'
import { therapistService } from '../../services/therapistService'

export function ReferralDetailPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const referralId = Number(useParams().referralId)
  const [therapistId, setTherapistId] = useState(0)
  const [reason, setReason] = useState('')
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: referralService.list })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: therapistService.list })
  const referral = referrals.data?.find((item) => item.id === referralId)
  const actionMutation = useMutation({
    mutationFn: async (action: 'assume' | 'withdraw') => {
      if (action === 'assume') return referralService.assume(referralId, therapistId)
      return referralService.withdraw(referralId, reason)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setTherapistId(0)
      setReason('')
    },
  })

  if (referrals.isLoading || therapists.isLoading) return <section className="page-content"><ApiLoading label="Carregando encaminhamento..." /></section>
  if (referrals.isError || therapists.isError) return <section className="page-content"><ApiError error={referrals.error ?? therapists.error} retry={() => { void referrals.refetch(); void therapists.refetch() }} /></section>
  if (!referral) return <section className="page-content"><ApiError error={new Error('Encaminhamento não encontrado.')} retry={() => navigate('/encaminhamentos')} /></section>

  return (
    <SubpageShell eyebrow="FISIOSYSTEM" title={`Encaminhamento #${referral.id}`} description={`Recebido em ${formatDate(referral.dataEntrega)}`} fallback="/encaminhamentos" backLabel="encaminhamentos">
      <div className="patient-profile subpage-profile">
        <div className="referral-profile-card">
          <span className="profile-avatar">{initials(referral.pacienteNome)}</span>
          <div className="referral-profile-copy"><div className="referral-profile-heading"><strong>{referral.pacienteNome || 'Paciente não informado'}</strong><StatusBadge>{getStatusEncaminhamentoLabel(referral.statusEncaminhamento)}</StatusBadge></div><h3>{referral.patologia || 'Patologia não informada'}</h3><p>Prioridade {getPrioridadeLabel(referral.prioridade).toLocaleLowerCase('pt-BR')} <i /> {referral.tipoAtendimento || 'Tipo não informado'}</p></div>
        </div>
        <div className="profile-info-grid"><div><span>Médico solicitante</span><strong>{referral.medicoSolicitante || 'Não informado'}</strong></div><div><span>Responsável</span><strong>{referral.fisioterapeutaResponsavelNome || 'Não atribuído'}</strong></div><div><span>Assunção</span><strong>{formatDate(referral.dataAssuncao)}</strong></div><div><span>Alta</span><strong>{formatDate(referral.dataAlta)}</strong></div></div>
        <ReferralConsultationHistory referralId={referral.id} />
        <div className="subpage-work-grid">
          {referral.statusEncaminhamento === 'NA_FILA' && <div className="form-section referral-assume-section"><label className="field"><span>Fisioterapeuta que assumirá o caso</span><select value={therapistId} onChange={(event) => setTherapistId(Number(event.target.value))}><option value={0}>Selecione</option>{therapists.data?.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome} • {item.crefito}</option>)}</select></label><div className="referral-action-row"><button className="primary-button" disabled={!therapistId || actionMutation.isPending} onClick={() => actionMutation.mutate('assume')}>Assumir encaminhamento</button></div></div>}
          {!['ALTA', 'RETIRADO_PELO_PACIENTE'].includes(referral.statusEncaminhamento) && <div className="form-section referral-withdraw-section"><label className="field field-wide"><span>Motivo da retirada</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Preencha somente para retirada pelo paciente" /></label><div className="referral-action-row"><button className="secondary-button" disabled={!reason.trim() || actionMutation.isPending} onClick={() => actionMutation.mutate('withdraw')}>Registrar retirada</button></div></div>}
        </div>
        <MutationError error={actionMutation.error} />
      </div>
    </SubpageShell>
  )
}

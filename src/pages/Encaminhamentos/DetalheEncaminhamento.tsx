import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { HistoricoConsultasEncaminhamento } from '../../components/referrals/HistoricoConsultasEncaminhamento'
import { ModalAcaoConcluida } from '../../components/ui/ModalAcaoConcluida'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/EstadoApi'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import {
  formatarData,
  obterRotuloPrioridade,
  obterRotuloStatusEncaminhamento,
  iniciais,
} from '../../lib/dominio'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'
import { servicoFisioterapeuta } from '../../services/servicoFisioterapeuta'
import type { Encaminhamento } from '../../types/modelos'

interface CompletedReferralAction {
  kind: 'assume' | 'withdraw'
  referral: Encaminhamento
}

export function DetalheEncaminhamento() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const referralId = Number(useParams().referralId)
  const [therapistId, setTherapistId] = useState(0)
  const [reason, setReason] = useState('')
  const [completedAction, setCompletedAction] = useState<CompletedReferralAction | null>(null)
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: servicoEncaminhamento.listar })
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: servicoFisioterapeuta.listar })
  const referral = referrals.data?.find((item) => item.id === referralId)
  const actionMutation = useMutation({
    mutationFn: async (action: 'assume' | 'withdraw') => {
      if (action === 'assume') return servicoEncaminhamento.assumir(referralId, therapistId)
      return servicoEncaminhamento.retirar(referralId, reason)
    },
    onSuccess: (updatedReferral, action) => {
      void queryClient.invalidateQueries({ queryKey: ['referrals'] })
      void queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setCompletedAction({ kind: action, referral: updatedReferral })
      setTherapistId(0)
      setReason('')
    },
  })

  if (referrals.isLoading || therapists.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando encaminhamento..." />
      </section>
    )
  if (referrals.isError || therapists.isError)
    return (
      <section className="page-content">
        <ApiError
          error={referrals.error ?? therapists.error}
          retry={() => {
            void referrals.refetch()
            void therapists.refetch()
          }}
        />
      </section>
    )
  if (!referral)
    return (
      <section className="page-content">
        <ApiError
          error={new Error('Encaminhamento não encontrado.')}
          retry={() => navigate('/encaminhamentos')}
        />
      </section>
    )

  return (
    <>
      <EstruturaSubpagina
        eyebrow="FISIOSYSTEM"
        title={`Encaminhamento #${referral.id}`}
        description={`Recebido em ${formatarData(referral.dataEntrega)}`}
        fallback="/encaminhamentos"
        backLabel="encaminhamentos"
      >
        <div className="patient-profile subpage-profile">
          <div className="referral-profile-card">
            <span className="profile-avatar">{iniciais(referral.pacienteNome)}</span>
            <div className="referral-profile-copy">
              <div className="referral-profile-heading">
                <strong>{referral.pacienteNome || 'Paciente não informado'}</strong>
                <SeloStatus>
                  {obterRotuloStatusEncaminhamento(referral.statusEncaminhamento)}
                </SeloStatus>
              </div>
              <h3>{referral.patologia || 'Patologia não informada'}</h3>
              <p>
                Prioridade {obterRotuloPrioridade(referral.prioridade).toLocaleLowerCase('pt-BR')}{' '}
                <i /> {referral.tipoAtendimento || 'Tipo não informado'}
              </p>
            </div>
          </div>
          <div className="profile-info-grid">
            <div>
              <span>Médico solicitante</span>
              <strong>{referral.medicoSolicitante || 'Não informado'}</strong>
            </div>
            <div>
              <span>Responsável</span>
              <strong>{referral.fisioterapeutaResponsavelNome || 'Não atribuído'}</strong>
            </div>
            <div>
              <span>Assunção</span>
              <strong>{formatarData(referral.dataAssuncao)}</strong>
            </div>
            <div>
              <span>Alta</span>
              <strong>{formatarData(referral.dataAlta)}</strong>
            </div>
          </div>
          <HistoricoConsultasEncaminhamento referralId={referral.id} />
          <div className="subpage-work-grid">
            {referral.statusEncaminhamento === 'NA_FILA' && (
              <div className="form-section referral-assume-section">
                <label className="field">
                  <span>Fisioterapeuta que assumirá o caso</span>
                  <select
                    value={therapistId}
                    onChange={(event) => setTherapistId(Number(event.target.value))}
                  >
                    <option value={0}>Selecione</option>
                    {therapists.data
                      ?.filter((item) => item.ativo)
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.nome} • {item.crefito}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="referral-action-row">
                  <button
                    className="primary-button"
                    disabled={!therapistId || actionMutation.isPending}
                    onClick={() => actionMutation.mutate('assume')}
                  >
                    Assumir encaminhamento
                  </button>
                </div>
              </div>
            )}
            {!['ALTA', 'RETIRADO_PELO_PACIENTE'].includes(referral.statusEncaminhamento) && (
              <div className="form-section referral-withdraw-section">
                <label className="field field-wide">
                  <span>Motivo da retirada</span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Preencha somente para retirada pelo paciente"
                  />
                </label>
                <div className="referral-action-row">
                  <button
                    className="secondary-button"
                    disabled={!reason.trim() || actionMutation.isPending}
                    onClick={() => actionMutation.mutate('withdraw')}
                  >
                    Registrar retirada
                  </button>
                </div>
              </div>
            )}
          </div>
          <MutationError error={actionMutation.error} />
        </div>
      </EstruturaSubpagina>
      <ModalAcaoConcluida
        open={Boolean(completedAction)}
        title={
          completedAction?.kind === 'assume'
            ? 'Encaminhamento assumido com sucesso'
            : 'Retirada registrada com sucesso'
        }
        description="A situação do encaminhamento foi atualizada pelo sistema."
        message={
          completedAction?.kind === 'assume'
            ? 'O caso já está vinculado ao fisioterapeuta responsável.'
            : 'O encaminhamento foi retirado da fila e o motivo ficou registrado.'
        }
        actionLabel="Voltar para encaminhamentos"
        onClose={() => navigate('/encaminhamentos', { replace: true })}
        details={
          completedAction
            ? [
                {
                  icon: UserRound,
                  label: 'Paciente',
                  value: completedAction.referral.pacienteNome || 'Não informado',
                },
                {
                  icon: ClipboardCheck,
                  label:
                    completedAction.kind === 'assume' ? 'Fisioterapeuta responsável' : 'Protocolo',
                  tone: completedAction.kind === 'assume' ? 'blue' : 'orange',
                  value:
                    completedAction.kind === 'assume'
                      ? completedAction.referral.fisioterapeutaResponsavelNome || 'Não informado'
                      : `#${completedAction.referral.id}`,
                },
              ]
            : []
        }
      />
    </>
  )
}

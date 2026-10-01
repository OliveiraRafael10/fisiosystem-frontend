import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarCheck, Phone, Stethoscope } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading, MutationError } from '../../components/ui/EstadoApi'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import { formatarDataHora, obterRotuloStatusConsulta, iniciais } from '../../lib/dominio'
import { servicoConsulta } from '../../services/servicoConsulta'
import { servicoFisioterapeuta } from '../../services/servicoFisioterapeuta'

export function DetalheFisioterapeuta() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const therapistId = Number(useParams().therapistId)
  const therapists = useQuery({ queryKey: ['therapists'], queryFn: servicoFisioterapeuta.listar })
  const appointments = useQuery({ queryKey: ['appointments'], queryFn: servicoConsulta.listar })
  const therapist = therapists.data?.find((item) => item.id === therapistId)
  const therapistAppointments = (appointments.data ?? [])
    .filter((item) => item.fisioterapeutaId === therapistId)
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
  const toggleMutation = useMutation({
    mutationFn: () => {
      if (!therapist) throw new Error('Fisioterapeuta não encontrado.')
      return therapist.ativo
        ? servicoFisioterapeuta.inativar(therapist.id)
        : servicoFisioterapeuta.ativar(therapist.id)
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['therapists'] }),
  })

  if (therapists.isLoading || appointments.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando profissional..." />
      </section>
    )
  if (therapists.isError || appointments.isError)
    return (
      <section className="page-content">
        <ApiError
          error={therapists.error ?? appointments.error}
          retry={() => {
            void therapists.refetch()
            void appointments.refetch()
          }}
        />
      </section>
    )
  if (!therapist)
    return (
      <section className="page-content">
        <ApiError
          error={new Error('Fisioterapeuta não encontrado.')}
          retry={() => navigate('/fisioterapeutas')}
        />
      </section>
    )

  return (
    <EstruturaSubpagina
      eyebrow="EQUIPE CLÍNICA"
      title={therapist.nome}
      description={therapist.crefito || 'Profissional sem CREFITO informado'}
      fallback="/fisioterapeutas"
      backLabel="fisioterapeutas"
      actions={<SeloStatus>{therapist.ativo ? 'Ativo' : 'Inativo'}</SeloStatus>}
    >
      <div className="subpage-profile">
        <div className="profile-hero">
          <span className="profile-avatar">{iniciais(therapist.nome)}</span>
          <div>
            <span className="specialty-label">Fisioterapia</span>
            <h3>{therapist.nome}</h3>
            <p>
              <Phone size={16} /> {therapist.telefone || 'Telefone não informado'}
            </p>
          </div>
        </div>
        <div className="profile-info-grid">
          <div>
            <span>Situação funcional</span>
            <strong>{therapist.ativo ? 'Profissional ativo' : 'Profissional inativo'}</strong>
          </div>
          <div>
            <span>Consultas registradas</span>
            <strong>{therapistAppointments.length}</strong>
          </div>
        </div>
        <div className="form-section therapist-management">
          <div className="form-section-title">
            <span>
              <Stethoscope size={20} />
            </span>
            <div>
              <strong>Gestão do profissional</strong>
              <small>Controle o acesso à agenda clínica</small>
            </div>
          </div>
          <p>
            {therapist.ativo
              ? 'Ao inativar, o profissional deixa de aparecer nas opções para novos atendimentos.'
              : 'Ao ativar, o profissional volta a ficar disponível para novos atendimentos.'}
          </p>
          <MutationError error={toggleMutation.error} />
          <button
            className={therapist.ativo ? 'secondary-button' : 'primary-button'}
            disabled={toggleMutation.isPending}
            onClick={() => toggleMutation.mutate()}
          >
            {toggleMutation.isPending
              ? 'Atualizando...'
              : therapist.ativo
                ? 'Inativar profissional'
                : 'Ativar profissional'}
          </button>
        </div>
        <div className="profile-section-heading">
          <div>
            <span>
              <CalendarCheck size={19} />
            </span>
            <div>
              <strong>Histórico de consultas</strong>
              <small>Atendimentos mais recentes do profissional</small>
            </div>
          </div>
        </div>
        <div className="subpage-card-list">
          {therapistAppointments.map((appointment) => (
            <button
              className="professional-appointment-card"
              key={appointment.id}
              onClick={() =>
                navigate(`/consultas/${appointment.id}`, {
                  state: { from: `/fisioterapeutas/${therapist.id}` },
                })
              }
            >
              <div>
                <strong>{appointment.pacienteNome || 'Paciente não informado'}</strong>
                <span>{formatarDataHora(appointment.dataHora)}</span>
              </div>
              <SeloStatus>{obterRotuloStatusConsulta(appointment.status)}</SeloStatus>
            </button>
          ))}
        </div>
        {!therapistAppointments.length && (
          <div className="empty-care">
            <CalendarCheck size={24} />
            <strong>Nenhuma consulta registrada</strong>
            <p>Os atendimentos deste profissional aparecerão aqui.</p>
          </div>
        )}
      </div>
    </EstruturaSubpagina>
  )
}

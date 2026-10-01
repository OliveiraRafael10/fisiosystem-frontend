import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ClipboardPlus, MapPin, Pencil, Phone } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, ApiLoading } from '../../components/ui/EstadoApi'
import { SeloStatus } from '../../components/ui/SeloStatus'
import { EstruturaSubpagina } from '../../components/ui/EstruturaSubpagina'
import {
  formatarData,
  obterRotuloPrioridade,
  obterRotuloStatusEncaminhamento,
  iniciais,
  tomPrioridade,
} from '../../lib/dominio'
import { servicoPaciente } from '../../services/servicoPaciente'
import { servicoEncaminhamento } from '../../services/servicoEncaminhamento'

export function DetalhePaciente() {
  const navigate = useNavigate()
  const location = useLocation()
  const patientId = Number(useParams().patientId)
  const patients = useQuery({ queryKey: ['patients'], queryFn: servicoPaciente.listar })
  const referrals = useQuery({ queryKey: ['referrals'], queryFn: servicoEncaminhamento.listar })
  const patient = patients.data?.find((item) => item.id === patientId)

  if (patients.isLoading || referrals.isLoading)
    return (
      <section className="page-content">
        <ApiLoading label="Carregando prontuário..." />
      </section>
    )
  if (patients.isError || referrals.isError)
    return (
      <section className="page-content">
        <ApiError
          error={patients.error ?? referrals.error}
          retry={() => {
            void patients.refetch()
            void referrals.refetch()
          }}
        />
      </section>
    )
  if (!patient)
    return (
      <section className="page-content">
        <ApiError
          error={new Error('Paciente não encontrado.')}
          retry={() => navigate('/pacientes')}
        />
      </section>
    )

  const patientReferrals = (referrals.data ?? []).filter((item) => item.pacienteId === patient.id)
  const inTreatment = patientReferrals.some((item) => item.statusEncaminhamento === 'EM_TRATAMENTO')

  return (
    <EstruturaSubpagina
      eyebrow={`PACIENTE #${String(patient.id).padStart(5, '0')}`}
      title={patient.nome}
      description={`Cartão SUS ${patient.numeroSus}`}
      fallback="/pacientes"
      backLabel="pacientes"
      actions={
        <button
          className="subpage-header-button"
          onClick={() =>
            navigate(`/pacientes/${patient.id}/editar`, { state: { from: location.pathname } })
          }
        >
          <Pencil size={18} /> Editar dados
        </button>
      }
    >
      <div className="patient-profile subpage-profile">
        <div className="profile-hero">
          <span className="profile-avatar">{iniciais(patient.nome)}</span>
          <div>
            <SeloStatus>{inTreatment ? 'Em tratamento' : 'Cadastrado'}</SeloStatus>
            <h3>{patient.nome}</h3>
            <p>SUS {patient.numeroSus}</p>
          </div>
        </div>
        <div className="profile-info-grid">
          <div>
            <span>
              <CalendarDays size={17} /> Nascimento
            </span>
            <strong>{formatarData(patient.dataNascimento)}</strong>
          </div>
          <div>
            <span>
              <Phone size={17} /> Telefone
            </span>
            <strong>{patient.telefone || 'Não informado'}</strong>
          </div>
          <div>
            <span>
              <MapPin size={17} /> Endereço
            </span>
            <strong>{patient.endereco || 'Não informado'}</strong>
          </div>
          <div>
            <span>
              <CalendarDays size={17} /> Entrada
            </span>
            <strong>{formatarData(patient.dataEntrada)}</strong>
          </div>
        </div>
        <div className="profile-section-heading">
          <div>
            <span>
              <ClipboardPlus size={19} />
            </span>
            <div>
              <strong>Jornada de cuidado</strong>
              <small>Encaminhamentos vinculados ao paciente</small>
            </div>
          </div>
        </div>
        <div className="subpage-card-list">
          {patientReferrals.map((referral) => (
            <button
              className="care-card"
              key={referral.id}
              onClick={() =>
                navigate(`/encaminhamentos/${referral.id}`, { state: { from: location.pathname } })
              }
            >
              <div className="care-card-top">
                <span className={`priority-pill priority-${tomPrioridade(referral.prioridade)}`}>
                  {obterRotuloPrioridade(referral.prioridade)}
                </span>
                <SeloStatus>
                  {obterRotuloStatusEncaminhamento(referral.statusEncaminhamento)}
                </SeloStatus>
              </div>
              <h4>{referral.patologia || 'Patologia não informada'}</h4>
              <p>
                {referral.medicoSolicitante || 'Médico não informado'} •{' '}
                {referral.tipoAtendimento || 'Tipo não informado'}
              </p>
            </button>
          ))}
        </div>
        {!patientReferrals.length && (
          <div className="empty-care">
            <ClipboardPlus size={24} />
            <strong>Nenhum encaminhamento</strong>
            <p>Este prontuário ainda não possui jornada de cuidado.</p>
          </div>
        )}
      </div>
    </EstruturaSubpagina>
  )
}

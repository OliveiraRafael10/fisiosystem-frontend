interface StatusBadgeProps {
  children: string
}

const toneByStatus: Record<string, string> = {
  'Em tratamento': 'status-treatment',
  Assumido: 'status-treatment',
  Agendada: 'status-waiting',
  Aguardando: 'status-waiting',
  'Aguardando vaga': 'status-waiting',
  Alta: 'status-discharged',
  Inativo: 'status-inactive',
  Concluído: 'status-discharged',
  Confirmada: 'status-treatment',
  Disponível: 'status-discharged',
  'Em atendimento': 'status-waiting',
  Pendente: 'status-waiting',
  Realizada: 'status-discharged',
  Cancelada: 'status-inactive',
  Falta: 'status-inactive',
  Retirado: 'status-inactive',
  Ausente: 'status-inactive',
  Ativo: 'status-discharged',
  Cadastrado: 'status-discharged',
  'Sem encaminhamento': 'status-inactive',
}

export function StatusBadge({ children }: StatusBadgeProps) {
  return <span className={`status-badge ${toneByStatus[children] ?? 'status-inactive'}`}><i />{children}</span>
}

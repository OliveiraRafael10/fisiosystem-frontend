interface StatusBadgeProps {
  children: string
}

interface StatusTone {
  badge: string
  dot: string
}

const treatmentTone: StatusTone = {
  badge: 'bg-[#e8f5ef] text-[#28725e]',
  dot: 'bg-[#409875]',
}

const waitingTone: StatusTone = {
  badge: 'bg-[#fff1e5] text-[#aa6738]',
  dot: 'bg-[#db8b51]',
}

const dischargedTone: StatusTone = {
  badge: 'bg-[#eaf2f9] text-[#5279a0]',
  dot: 'bg-[#6a96bf]',
}

const inactiveTone: StatusTone = {
  badge: 'bg-[#edf1f0] text-[#7e8b89]',
  dot: 'bg-[#98a3a2]',
}

const toneByStatus: Record<string, StatusTone> = {
  'Em tratamento': treatmentTone,
  Assumido: treatmentTone,
  Confirmada: treatmentTone,
  Agendada: waitingTone,
  Aguardando: waitingTone,
  'Aguardando vaga': waitingTone,
  'Em atendimento': waitingTone,
  Pendente: waitingTone,
  Alta: dischargedTone,
  Concluído: dischargedTone,
  Disponível: dischargedTone,
  Realizada: dischargedTone,
  Ativo: dischargedTone,
  Cadastrado: dischargedTone,
  Inativo: inactiveTone,
  Cancelada: inactiveTone,
  Falta: inactiveTone,
  Retirado: inactiveTone,
  Ausente: inactiveTone,
  'Sem encaminhamento': inactiveTone,
}

export function StatusBadge({ children }: StatusBadgeProps) {
  const tone = toneByStatus[children] ?? inactiveTone

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-bold ${tone.badge}`}
    >
      <i className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {children}
    </span>
  )
}
